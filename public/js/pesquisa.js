//objeto do tipo pesquisa, para facilitar a construção da query
var Pesquisa = function(frase, diretorio, tipoPesquisa, formato, dataInicial, dataFinal, autor, subdiretorio){
	return {
		frase  : frase,
		diretorio : diretorio,
		tipoPesquisa : tipoPesquisa,
		formato : formato,
		dataInicial : dataInicial,
		dataFinal : dataFinal,
		autor: autor,
		subdiretorio: subdiretorio,

		setPesquisa: function(objeto){
				objeto.frase = $("#query").val();
				objeto.tipoPesquisa = $("#padraoPesquisa").val();
				objeto.diretorio = $("#indicesId").val();
				objeto.autor = $("#autor").val();
				objeto.formato = $("#formato").val();
				objeto.dataInicial = $("#dataInicial").val();
				objeto.dataFinal = $("#dataFinal").val();
				objeto.subdiretorio = $("#subdiretorio").val();

				return objeto;
			}

	};
}
