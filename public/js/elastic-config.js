function iniciaIndices(){
	
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

function construirUrl(indice, stringConexao){

	var requisicaoURL;
	requisicaoURL = ""+stringConexao+"/"+indice+"/_search?pretty";

	if (indice == "Todos"){
		requisicaoURL = ""+stringConexao+"/_search?pretty";
	}

	return requisicaoURL;
}


function construirUrlDeBusca(indice, tamanho, stringConexao){

	var requisicaoURL;
	requisicaoURL = ""+stringConexao+"/"+indice+"/_search?size=10000&pretty";

	if (indice == "Todos"){
		requisicaoURL = ""+stringConexao+"/_search?size=10000&pretty";
	}

	return requisicaoURL;

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

	for (var i = 0; i < frase.length; i++){
		frase = frase.replace("AND","");
		frase = frase.replace("OR","");
		frase = frase.replace("  ", " ");

	}

	return frase;
}

function iniciaQuery(pesquisa){

	var conexao = new Conexao();

	var urlHTTP = construirUrl(pesquisa.diretorio, conexao.getStringConexao());
	 
	jQuery.post(urlHTTP, JSON.stringify({
		"query": {
       		"match_all": {
       		}
       	}

	}), function (data) {

		executaBusca(pesquisa, data.hits.total, conexao.getStringConexao());
		

	}, 'json')

	.fail(function() {
    	alert( "Erro na requisição de indice" );

  	}); 
}



function executaBusca(pesquisa, tamanho, stringConexao){

	var urlHTTP = construirUrlDeBusca(pesquisa.diretorio, tamanho, stringConexao);
	var query = formataQuery(pesquisa);

	jQuery.post(urlHTTP, JSON.stringify({
  		"query": query
	}), function (data) {

    	$('#posts').empty();
		formataPosts(data, pesquisa.frase);
		console.log("array", data.hits.hits.length);

	}, 'json')

	.fail(function() {
    	alert( "Erro na requisição de busca" );

  	}); 
}


function formataQuery(pesquisa){

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

function adicionaFiltros(pesquisa, query) {

	var filtro = {"filter": [  ] };
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

    console.log(query);

  return query;

}


