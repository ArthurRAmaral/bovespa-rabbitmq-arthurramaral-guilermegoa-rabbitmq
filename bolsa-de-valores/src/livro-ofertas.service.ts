import { CompraDto } from './dto/compra.dto';
import { VendaDto } from './dto/venda.dto';
import { TransacaoDto } from './dto/transacao.dto';
import { Injectable } from '@nestjs/common';
import { AmqpConnection } from '@golevelup/nestjs-rabbitmq';
import configuration from './configuration/configuration';

/**
 * @init
 * inicializa variáveis de ambiente
 */
const config = configuration();

const transacoesExchange = config.rabbitmq.exchanges.transacoes;
const transacoesPrefix = config.rabbitmq.prefix.transacoes;

/**
 * @class LivroOfertasService
 * @description
 * Essa classe server para salvar as comprar e vendas que ainda não foram feitas.
 * Além disso ela tem o metodo que verifica se vai haver um a transaçaõ ou não.
*/
@Injectable()
export class LivroOfertasService {
  Map_de_compra = new Map<string, CompraDto[]>();
  Map_de_venda = new Map<string, VendaDto[]>();
  Lista_de_transacoes: TransacaoDto[] = [];

  constructor(private readonly amqpConnection: AmqpConnection) {}

  /**
   * @function addCompra
   * @param compra
   * @param ativo 
   * @description
   * Metodo serve para adicionar uma nova compra a na lista de salvando no Map
   * de compra.
  */
  addCompra(compra: CompraDto, ativo: string): void {
    const listaAtivo = this.Map_de_compra.get(ativo);

    if (!listaAtivo) {
      this.Map_de_compra.set(ativo, [compra]);
      return;
    }

    this.Map_de_compra.delete(ativo);
    this.Map_de_compra.set(ativo, [...listaAtivo, compra]);

    return;
  }

  /**
   * @function addVenda
   * @param venda
   * @param ativo
   * @description
   * Metodo serve para adicionar uma nova compra a na lista de salvando no Map
   * de venda.
  */
  addVenda(venda: VendaDto, ativo: string): void {
    const listaAtivo = this.Map_de_venda.get(ativo);

    if (!listaAtivo) {
      this.Map_de_venda.set(ativo, [venda]);
      return;
    }

    this.Map_de_venda.delete(ativo);
    this.Map_de_venda.set(ativo, [...listaAtivo, venda]);

    return;
  }


  /**
   * @function addVenda
   * @param ativo
   * @description
   * Metodo principal da classe. Ele serve para verificar se tem um compra e venda
   * valida para ocorrer uma transação. O metodo passa por toda lista de venda,
   * verificando se existe compra que case com a venda e salva a transação caso 
   * ocorra.
  */
  verifica(ativo: string): TransacaoDto[] {
    const lista_ativo_venda = this.Map_de_venda.get(ativo);// Pega a lista de venda de determindo ativo
    const lista_ativo_compra = this.Map_de_compra.get(ativo);// Pega a lista de venda de determindo ativo

    const transacoes: TransacaoDto[] = [];//Inicia a lista de transações

    if (!lista_ativo_venda || !lista_ativo_compra) { //Verifica se exite a lista de venda e compra
      return transacoes;
    }

    lista_ativo_venda.forEach((venda) => {// Percorre a lista de venda
      let fazerMaisCompra = true;

      while (venda.quantidade > 0 && fazerMaisCompra) {// Verifica se ainda pode-se fazer uma transação coma venda
        const compra = this.Map_de_compra.get(ativo).find(// Encontra a primeira compra que seja valida para fazer a transação 
          (compra) => compra.valor >= venda.valor,
        );

        fazerMaisCompra = !!compra;// Verifica se exite uma compra ou não, retornando um boolean

        if (fazerMaisCompra) {// Verifica se foi encontrada alguma compra valida
          const caso = this.achaCaso(compra, venda); // Acho o caso menor, maior ou igual na relação entre compra e venda

          switch (caso) {
            case 'compra_menor_venda':
              transacoes.push(
                this.salvaTransacao(compra, venda, compra.quantidade),
              );
              venda.quantidade -= compra.quantidade;// Salva a nova qunatidade de venda
              compra.quantidade = 0;
              this.limpaListaQuantidadeZerada(this.Map_de_compra, ativo);
              break;
            case 'compra_igual_venda':
              transacoes.push(
                this.salvaTransacao(compra, venda, compra.quantidade),
              );
              compra.quantidade = 0;
              venda.quantidade = 0;
              this.limpaListaQuantidadeZerada(this.Map_de_venda, ativo);
              this.limpaListaQuantidadeZerada(this.Map_de_compra, ativo);
              break;
            case 'compra_maior_venda':
              transacoes.push(
                this.salvaTransacao(compra, venda, venda.quantidade),
              );
              compra.quantidade -= venda.quantidade;// Salva a nova qunatidade de compra
              venda.quantidade = 0;
              this.limpaListaQuantidadeZerada(this.Map_de_venda, ativo);
              break;
          }
        }
      }
    });

    if (transacoes.length > 0) {// Verifica se alguma transaçaõ foi feita
      transacoes.forEach((transacao) =>
        this.amqpConnection.publish(// Envia mensagem do tipo FUNOUT com a transação feita
          transacoesExchange,
          `${transacoesPrefix}.${ativo}`,
          transacao,
        ),
      );
    }

    return transacoes;
  }

  /**
   * @function limpaListaQuantidadeZerada
   * @param map
   * @param ativo
   * @description
   * Metodo server para limpar a lista que tenha a quantidade zerada.
  */
  private limpaListaQuantidadeZerada(
    map: Map<string, CompraDto[] | VendaDto[]>,
    ativo: string,
  ) {
    const lista = map.get(ativo);

    if (!lista) {
      return;
    }

    const nova_lista = lista.filter((item) => item.quantidade !== 0);

    map.delete(ativo);
    map.set(ativo, nova_lista);
  }

  /**
   * @function achaCaso
   * @param compra
   * @param venda
   * @description
   * Metodo server para achar o caso de menor, maior ou igual na difirença entre
   * compra e venda, retorando o caso.
  */
  private achaCaso(compra: CompraDto, venda: VendaDto) {
    const diferenca_compra_venda = compra.quantidade - venda.quantidade;

    if (diferenca_compra_venda < 0) {
      return 'compra_menor_venda';
    } else if (diferenca_compra_venda === 0) {
      return 'compra_igual_venda';
    }
    return 'compra_maior_venda';
  }


  /**
   * @function achaCaso
   * @param compra
   * @param venda
   * @description
   * Metodo server para salvar a transação a Lista_de_transações da clase e retorna
   * a transação que foi feita.
  */
  private salvaTransacao(
    compra: CompraDto,
    venda: VendaDto,
    quantidade: number,
  ) {
    const transacao = {
      corr_cp: compra.corretora,
      corr_vd: venda.corretora,
      data_hora: new Date(),
      quant: quantidade,
      val: venda.valor,
    };
    this.Lista_de_transacoes.push(transacao);
    return transacao;
  }
}
