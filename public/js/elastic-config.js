function iniciaIndices(){ //busca os índices que estão indexados de forma dinâmica e joga seu resultado no select box.
	
	var conexao = new Conexao();
	$.ajax({
     	url: ""+conexao.getStringConexao()+"/_cat/indices?format=json&pretty",
        type: "GET",
        success: function(data) {
            for (var i = 0; i < data.length; i++){
            	if (data[i].index != '.kibana'){
            		$('#indicesId').append("<option class='cursor'> "+data[i].index+" </option>");

            	}
            }
        },
        error: function (jqXHR, exception) {

        	alert("Não foi possível conectar ao Elasticsearch");
        }
    });  
}

function iniciaQuery(pesquisa, paginacao){ //método que inicia a query, montando a URL http e chamando a execução da busca

	var conexao = new Conexao();
	var urlHTTP = construirUrl(pesquisa.diretorio, conexao.getStringConexao());
	executaBusca(pesquisa, paginacao, conexao.getStringConexao());
	
}

function construirUrl(indice, stringConexao){ //monta a URL conforme o índice especificado.

	var requisicaoURL;
	requisicaoURL = ""+stringConexao+"/"+indice+"/_search?pretty";

	if (indice == "Todos"){
		requisicaoURL = ""+stringConexao+"/_search?pretty";
	}

	return requisicaoURL;
}


function construirUrlDeBusca(indice, paginacao, stringConexao){
	//constroí a url de busca, neste método é passado o controle de paginação que está sendo executado, de 10 em 10.

	var requisicaoURL;
	requisicaoURL = ""+stringConexao+"/"+indice+"/_search?size=10&from="+paginacao+"";

	if (indice == "Todos"){
		requisicaoURL = ""+stringConexao+"/_search?size=10&from="+paginacao+"";
	}

	return requisicaoURL; //retorna a URL formata com os resultados que deve trazer

}

function formataURL(url){

	return encodeURI(url);

}

function destacaPalavras(texto, palavrasChave){

	palavrasChave = palavrasChave.split(" ");

	for (var i = 0; i < palavrasChave.length; i++){
		texto = texto.toLowerCase().replace(palavrasChave[i].toLowerCase(),"<b>"+palavrasChave[i]+"</b>");

	}

	return texto;
}

function formataPalavrasChaves(frase){
 //apenas tira os operadores lógicos quando a busca for booleana, para destacar apenas os termos pesquisados

	for (var i = 0; i < frase.length; i++){
		frase = frase.replace("AND","");
		frase = frase.replace("OR","");
		frase = frase.replace("  ", " ");

	}

	return frase;
}

function executaBusca(pesquisa, paginacao, stringConexao){ //executa a busca inicial, ou seja, os primeiros 10 resultados

	var urlHTTP = construirUrlDeBusca(pesquisa.diretorio, paginacao, stringConexao);
	var query = formataQuery(pesquisa);

	jQuery.post(urlHTTP, JSON.stringify({
  		"query": query
	}), function (data) {

		formataPosts(data, pesquisa, query);

	}, 'json')

	.fail(function() {
    	alert( "Erro na requisição de busca" );

  	}); 
}


function formataQuery(pesquisa){ //formata o tipo de busca, conforme especificado no formulário

	var query = {"bool": { "must": [ { "match": { "content": pesquisa.frase } } ] } };

	if (pesquisa.tipoPesquisa == "Citação"){
		query = {"bool": { "must": [ { "match_phrase": { "content": pesquisa.frase } } ] } };
	}

	if (pesquisa.tipoPesquisa == "Palavras-chave"){
		query = { "bool": { "must": [ { "query_string": { "default_field": "content", "query": pesquisa.frase } } ] } };
	}

	adicionaFiltros(pesquisa, query);

	return query;

}

function adicionaFiltros(pesquisa, query) { //Cria os filtros conforma os campos preenchidos do formulário

	var filtro = {"filter": [  ] }; //monta o objeto de filtro, no formato JSON
    Object.assign(query.bool, filtro);

    if (pesquisa.dataInicial != "" && pesquisa.dataFinal != ""){
    	 filtro = { 
                "range": {
                    "file.last_modified": {
                        "gt": pesquisa.dataInicial,
                        "lte": pesquisa.dataFinal,
                        "format": "dd/MM/yyyy||yyyy"
                    }
                }
        }

		query.bool.filter.push(filtro);
    }

    if (pesquisa.formato != "" ) {
    	 filtro = {
                  "term": {
            		"file.extension": pesquisa.formato.toLowerCase()              	
              }
        }

        query.bool.filter.push(filtro);
    }

    if (pesquisa.autor != "" ) {
    	 filtro = {
                  "regexp": {
            		"meta.author": ".*"+pesquisa.autor.toLowerCase()+".*"             	
              }
        }

        query.bool.filter.push(filtro);
    }

    if (pesquisa.subdiretorio != ''){
    	filtro = {
                  "regexp": {
            		"path.virtual": "/"+pesquisa.subdiretorio+".*"             	
              }
        }

        query.bool.filter.push(filtro);
    }

  return query; //faz o retorno dos filtros

}

function executaBuscaPaginada(paginacao, query, pesquisa){ //executa a busca de paginação, passando o próximo bloco de resultados

	var conexao = new Conexao();
	var urlHTTP = construirUrlDeBusca(pesquisa.diretorio, paginacao, conexao.getStringConexao());

	jQuery.post(urlHTTP, JSON.stringify({
  		"query": query
	}), function (data) {

		paginacaoResultados(data, pesquisa, query);

	}, 'json')

	.fail(function() {
    	alert( "Erro na requisição de busca" );

  	}); 
}


