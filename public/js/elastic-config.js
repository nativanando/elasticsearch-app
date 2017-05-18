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
	requisicaoURL = 'http://localhost:9200/'+indice+'/_search?size='+tamanho+'&pretty';

	if (indice == "Todos"){
		requisicaoURL = 'http://localhost:9200/_search?size='+tamanho+'&pretty';
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

function iniciaQuery(tipoPesquisa, indice, frase){

	var urlHTTP = construirUrl(indice);
	 
	jQuery.post(urlHTTP, JSON.stringify({
		"query": {
       		"match_all": {
       		}
       	}

	}), function (data) {

		verificaTipoDePesquisa(indice, data.hits.total, frase, tipoPesquisa);
		

	}, 'json')

	.fail(function() {
    	alert( "Erro na requisição de indice" );

  	}); 
}



function buscaSemFiltros(indice, tamanho, frase, tipoPesquisa){

	var urlHTTP = construirUrlDeBusca(indice, tamanho);
	var filtro = {"match": { "content": { "query": frase } } }

	if (tipoPesquisa == "Citação"){

		filtro = {"match_phrase": { "content": { "query": frase } } }
	}

	if (tipoPesquisa == "Palavras-chave"){

		filtro = {"query_string": { "default_field": "content", "query": frase } } 
	}


	jQuery.post(urlHTTP, JSON.stringify({
  		"query": filtro
	}), function (data) {

    	$('#posts').empty();
		formataPosts(data, frase);
		console.log("array", data.hits.hits.length);

	}, 'json')

	.fail(function() {
    	alert( "Erro na requisição de busca" );

  	}); 
}

function verificaTipoDePesquisa(indice, tamanho, frase, tipoPesquisa){

		buscaSemFiltros(indice, tamanho,frase, tipoPesquisa);

}


