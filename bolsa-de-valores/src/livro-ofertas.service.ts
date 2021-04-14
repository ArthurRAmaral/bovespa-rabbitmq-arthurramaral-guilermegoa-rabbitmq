import { CompraDto } from './dto/compra.dto';
import { VendaDto } from './dto/venda.dto';
import { TransacaoDto } from './dto/transacao.dto';
import { Injectable } from '@nestjs/common';

// TO DO -> Vamos vericar se o mesmo usario esta fazendo um update
// TO DO -> So fazer compra ou venda quando uma das duas fecharem

@Injectable()
export class LivroOfertasService {
  Map_de_compra = new Map<string, CompraDto[]>();
  Map_de_venda = new Map<string, VendaDto[]>();
  Lista_de_transacoes: TransacaoDto[] = [];

  verificaCompra(compra: CompraDto, ativo: string): TransacaoDto[] {
    const lista_ativo = this.Map_de_venda.get(ativo);
    let transacoes: TransacaoDto[];

    if (!lista_ativo.length) {
      this.Map_de_compra.set(ativo, [compra]);
      return [];
    }

    lista_ativo.forEach((venda) => {
      if (
        !this.ocorreTransacao(compra.valor, venda.valor) &&
        compra.quantidade
      ) {
        return;
      }

      const caso: string = this.acha_caso(compra.quantidade, venda.quantidade);

      this.efetuaCaso(caso, compra, venda, transacoes);
    });

    this.limpaListaQuantidadeZerada(this.Map_de_venda, ativo);

    if (compra.quantidade) {
      this.atualizaLista(this.Map_de_compra, ativo, compra);
    }

    return transacoes;
  }

  verificaVenda(venda: VendaDto, ativo: string): TransacaoDto[] {
    const lista_ativo = this.Map_de_compra.get(ativo);
    let transacoes: TransacaoDto[];

    if (!lista_ativo.length) {
      return [];
    }

    lista_ativo.forEach((compra) => {
      if (
        !this.ocorreTransacao(compra.valor, compra.valor) &&
        compra.quantidade
      ) {
        return;
      }

      const caso: string = this.acha_caso(compra.quantidade, venda.quantidade);

      this.efetuaCaso(caso, compra, venda, transacoes);
    });

    this.limpaListaQuantidadeZerada(this.Map_de_venda, ativo);

    if (venda.quantidade) {
      this.atualizaLista(this.Map_de_compra, ativo, venda);
    }

    return transacoes;
  }

  private atualizaLista(
    map: Map<string, CompraDto[] | VendaDto[]>,
    ativo: string,
    item_add: CompraDto | VendaDto,
  ) {
    const lista = map.get(ativo);

    if (lista) {
      this.Map_de_compra.delete(ativo);
      this.Map_de_compra.set(ativo, [...lista, item_add]);
    } else {
      this.Map_de_compra.set(ativo, [item_add]);
    }
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

  private efetuaCaso(
    caso: string,
    compra: CompraDto,
    venda: VendaDto,
    transacoes: TransacaoDto[],
  ) {
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

  private acha_caso(compra_quantidade: number, venda_quantidade: number) {
    const relacao_compra_venda = compra_quantidade - venda_quantidade;

    if (relacao_compra_venda < 0) {
      return 'compra_menor_venda';
    } else if (relacao_compra_venda === 0) {
      return 'compra_igual_venda';
    }
    return 'compra_maior_venda';
  }

  private ocorreTransacao(preco_compra: number, preco_venda) {
    return preco_compra <= preco_venda;
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
