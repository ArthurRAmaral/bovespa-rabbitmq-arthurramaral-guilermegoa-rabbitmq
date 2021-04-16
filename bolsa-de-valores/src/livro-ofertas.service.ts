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
const routingKey = config.rabbitmq.routingKey.transacoes;

@Injectable()
export class LivroOfertasService {
  Map_de_compra = new Map<string, CompraDto[]>();
  Map_de_venda = new Map<string, VendaDto[]>();
  Lista_de_transacoes: TransacaoDto[] = [];

  constructor(private readonly amqpConnection: AmqpConnection) {}

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
    this.amqpConnection.publish(
      transacoesExchange,
      routingKey,
      `Nome do ativo: ${ativo}`,
    );

    const lista_ativo_venda = this.Map_de_venda.get(ativo);
    const lista_ativo_compra = this.Map_de_compra.get(ativo);

    const transacoes: TransacaoDto[] = [];

    if (!lista_ativo_venda || !lista_ativo_compra) {
      return transacoes;
    }

    lista_ativo_venda.forEach((venda) => {
      const possicaoCompra = lista_ativo_compra.findIndex(
        (compra) => compra.valor === venda.valor,
      );

      const compra = lista_ativo_compra[possicaoCompra];

      const fazVenda = compra.valor === venda.valor;

      if (possicaoCompra && fazVenda) {
        const caso = this.achaCaso(venda.quantidade, compra.quantidade);

        this.salvaTransacao(this.Lista_de_transacoes, compra, venda);
        this.salvaTransacao(transacoes, compra, venda);

        switch (caso) {
          case 'compra_menor_venda':
            venda.quantidade -= compra.quantidade;
            compra.quantidade = 0;
            break;
          case 'compra_igual_venda':
            compra.quantidade = 0;
            venda.quantidade = 0;
            break;
          case 'compra_maior_venda':
            compra.quantidade -= venda.quantidade;
            venda.quantidade = 0;
            break;
        }
      }
    });

    this.limpaListaQuantidadeZerada(this.Map_de_venda, ativo);
    this.limpaListaQuantidadeZerada(this.Map_de_compra, ativo);

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

  private achaCaso(compra_quantidade: number, venda_quantidade: number) {
    const relacao_compra_venda = compra_quantidade - venda_quantidade;

    if (relacao_compra_venda < 0) {
      return 'compra_menor_venda';
    } else if (relacao_compra_venda === 0) {
      return 'compra_igual_venda';
    }
    return 'compra_maior_venda';
  }

  private salvaTransacao(
    lista: TransacaoDto[],
    compra: CompraDto,
    venda: VendaDto,
  ) {
    lista.push({
      corr_cp: compra.corretora,
      corr_vd: venda.corretora,
      data_hora: new Date(),
      quant: venda.quantidade,
      val: compra.valor,
    });
  }
}
