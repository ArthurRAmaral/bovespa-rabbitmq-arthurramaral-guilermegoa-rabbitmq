import { CompraDto } from './dto/compra.dto';
import { VendaDto } from './dto/venda.dto';
import { TransacaoDto } from './dto/transacao.dto';
import { Injectable } from '@nestjs/common';
import { AmqpConnection } from '@golevelup/nestjs-rabbitmq';
import configuration from './configuration/configuration';

// TO DO -> Vamos vericar se o mesmo usario esta fazendo um update
// TO DO -> So fazer compra ou venda quando uma das duas fecharem

const config = configuration();

const transacoesExchange = config.rabbitmq.exchanges.transacoes;
const transacoesPrefix = config.rabbitmq.prefix.transacoes;

@Injectable()
export class LivroOfertasService {
  Map_de_compra = new Map<string, CompraDto[]>();
  Map_de_venda = new Map<string, VendaDto[]>();
  Lista_de_transacoes: TransacaoDto[] = [];

  constructor(private readonly amqpConnection: AmqpConnection) { }

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

  verifica(ativo: string): TransacaoDto[] {
    const lista_ativo_venda = this.Map_de_venda.get(ativo);
    const lista_ativo_compra = this.Map_de_compra.get(ativo);

    const transacoes: TransacaoDto[] = [];

    if (!lista_ativo_venda || !lista_ativo_compra) {
      return transacoes;
    }

    lista_ativo_venda.forEach((venda) => {
      let fazerMaisCompra = true;

      while (venda.quantidade > 0 && fazerMaisCompra) {
        const compra = this.Map_de_compra.get(ativo).find(
          (compra) => compra.valor >= venda.valor,
        );

        fazerMaisCompra = !!compra;


        if (fazerMaisCompra) {
          const caso = this.achaCaso(compra, venda);

          switch (caso) {
            case 'compra_menor_venda':
              transacoes.push(this.salvaTransacao(compra, venda, compra.quantidade));
              venda.quantidade -= compra.quantidade;
              compra.quantidade = 0;
              this.limpaListaQuantidadeZerada(this.Map_de_compra, ativo);
              break;
            case 'compra_igual_venda':
              transacoes.push(this.salvaTransacao(compra, venda, compra.quantidade));
              compra.quantidade = 0;
              venda.quantidade = 0;
              this.limpaListaQuantidadeZerada(this.Map_de_venda, ativo);
              this.limpaListaQuantidadeZerada(this.Map_de_compra, ativo);
              break;
            case 'compra_maior_venda':
              transacoes.push(this.salvaTransacao(compra, venda, venda.quantidade));
              compra.quantidade -= venda.quantidade;
              venda.quantidade = 0;
              this.limpaListaQuantidadeZerada(this.Map_de_venda, ativo);
              break;
          }
        }
      }
    });

    if (transacoes.length > 0) {
      transacoes.forEach(transacao =>
        this.amqpConnection.publish(
          transacoesExchange,
          `${transacoesPrefix}.${ativo}`,
          JSON.stringify(transacao),
        )
      )
    }

    return transacoes;
  }

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

  private achaCaso(compra: CompraDto, venda: VendaDto) {
    const diferenca_compra_venda = compra.quantidade - venda.quantidade;

    if (diferenca_compra_venda < 0) {
      return 'compra_menor_venda';
    } else if (diferenca_compra_venda === 0) {
      return 'compra_igual_venda';
    }
    return 'compra_maior_venda';
  }

  private salvaTransacao(
    compra: CompraDto,
    venda: VendaDto,
    quantidade: number
  ) {
    const transacao = {
      corr_cp: compra.corretora,
      corr_vd: venda.corretora,
      data_hora: new Date(),
      quant: quantidade,
      val: venda.valor,
    }
    this.Lista_de_transacoes.push(transacao);
    return transacao;
  }
}
