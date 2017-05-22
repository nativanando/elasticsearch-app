function iniciaIndices(){

	 $.ajax({
     	url: "http://localhost:9200/_cat/indices?format=json&pretty",
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

function construirUrl(indice){

	var requisicaoURL;
	requisicaoURL = 'http://localhost:9200/'+indice+'/_search?pretty';

	if (indice == "Todos"){
		requisicaoURL = 'http://localhost:9200/_search?pretty';
	}

	return requisicaoURL;
}


function construirUrlDeBusca(indice, tamanho){

	var requisicaoURL;
	requisicaoURL = 'http://localhost:9200/'+indice+'/_search?size=10000&pretty';

	if (indice == "Todos"){
		requisicaoURL = 'http://localhost:9200/_search?size=10000&pretty';
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

	var urlHTTP = construirUrl(pesquisa.diretorio);
	 
	jQuery.post(urlHTTP, JSON.stringify({
		"query": {
       		"match_all": {
       		}
       	}

	}), function (data) {

		executaBusca(pesquisa, data.hits.total);
		

	}, 'json')

	.fail(function() {
    	alert( "Erro na requisição de indice" );

  	}); 
}



function executaBusca(pesquisa, tamanho){

	var urlHTTP = construirUrlDeBusca(pesquisa.diretorio, tamanho);
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

	var filtroData = {"filter": [  ] };
    Object.assign(query.bool, filtroData);


    if (pesquisa.dataInicial != "" && pesquisa.dataFinal != ""){
    	 filtroData = { 
                "range": {
                    "file.last_modified": {
                        "gt": pesquisa.dataInicial,
                        "lte": pesquisa.dataFinal,
                        "format": "dd/MM/yyyy||yyyy"
                    }
                }
        }

		query.bool.filter.push(filtroData);

    }

    if (pesquisa.formato != "" ) {
    	 filtroData = {
                  "term": {
            		"file.extension": pesquisa.formato.toLowerCase()              	
              }
        }

        query.bool.filter.push(filtroData);
    }

    if (pesquisa.autor != "" ) {
    	 filtroData = {
                  "regexp": {
            		"meta.author": ".*"+pesquisa.autor.toLowerCase()+".*"             	
              }
        }

        query.bool.filter.push(filtroData);
    }

    console.log(query);

  return query;

}


