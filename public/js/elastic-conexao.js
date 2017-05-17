
$(document).ready(function() {

      criaConexaoElastic();

});

$( "#calendario" ).on( "click", function() {
  $( "#calendario" ).datepicker({});

});

$("#formulario").submit(function(e) {

	var valor = $("#query").val();
	obtemTamanhoIndice($("#indicesId").val(), valor);
});

function criaConexaoElastic(){

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

function obtemTamanhoIndice(indice, frase){

	var urlHTTP = construirUrl(indice);
	 
	jQuery.post(urlHTTP, JSON.stringify({
		"query": {
       		"match_all": {
       		}
       	}

	}), function (data) {

		buscaPorFrase (indice, data.hits.total, frase);

	}, 'json')

	.fail(function() {
    	alert( "Erro na requisição de indice" );

  	}); 
}

function buscaPorFrase(indice, tamanho, frase){

	var urlHTTP = construirUrlDeBusca(indice, tamanho);
	console.log(frase);

	jQuery.post(urlHTTP, JSON.stringify({
  		"query": {
    		"query_string": {
     			"default_field": "content",
      			"query": frase
      		}
      	}

	}), function (data) {

    	$('#posts').empty();
		formataPosts(data, frase);

	}, 'json')

	.fail(function() {
    	alert( "Erro na requisição de busca" );

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

function formataPosts(resultado, frase){

	$("#content").scrollTop();
	var controlePaginacao = divisaoScroll(resultado);
	var palavrasChave = formataPalavrasChaves(frase);
	var indiceScroll = controlePaginacao;	

	if (resultado.hits.hits.length == 0){
     	$("#posts").append("<h4><center><b>Nehum resultado encontrado</b></center></h4>");  

  		return 0;
	}	
	
	for (var i = 0; i < controlePaginacao; i++){
		if (i < resultado.hits.hits.length){
			resultado.hits.hits[i]._source.file.last_modified = formataData(resultado.hits.hits[i]._source.file.last_modified);
			resultado.hits.hits[i]._source.file.url = formataURL(resultado.hits.hits[i]._source.file.url);
			resultado.hits.hits[i]._source.content = destacaPalavras(resultado.hits.hits[i]._source.content, palavrasChave);
     		$("#posts").append("\
     		<a href="+resultado.hits.hits[i]._source.file.url+" target='_blank'> <h4 class='color-link'>"+resultado.hits.hits[i]._source.file.filename+"</h4> </a>\
  			<h5><span class='glyphicon glyphicon-time'></span> "+resultado.hits.hits[i]._source.file.last_modified +"</h5>\
  			<h5 align='justify'>"+resultado.hits.hits[i]._source.content+"</h5>\
  			<h5><span class='label label-primary'>"+palavrasChave+"</span></h5><hr>");
     	}
     }

	$("#content").scroll(function() { 
		  if (indiceScroll < resultado.hits.hits.length){
          	if ($(this).scrollTop() + $(this).height() == $(this).get(0).scrollHeight) {
            	console.log("fim");
            	for (var i  = indiceScroll; i < (indiceScroll + controlePaginacao); i++){
            		if (indiceScroll < resultado.hits.hits.length){
            			resultado.hits.hits[i]._source.file.last_modified = formataData(resultado.hits.hits[i]._source.file.last_modified);
         				resultado.hits.hits[i]._source.file.url = formataURL(resultado.hits.hits[i]._source.file.url);
     					resultado.hits.hits[i]._source.content = destacaPalavras(resultado.hits.hits[i]._source.content, palavrasChave);
     					$("#posts").append("\
     					<a href="+resultado.hits.hits[i]._source.file.url+" target='_blank'> <h4 class='color-link'>"+resultado.hits.hits[i]._source.file.filename+"</h4> </a>\
  						<h5><span class='glyphicon glyphicon-time'></span> "+resultado.hits.hits[i]._source.file.last_modified +"</h5>\
  						<h5 align='justify'>"+resultado.hits.hits[i]._source.content+"</h5>\
  						<h5><span class='label label-primary'>"+palavrasChave+"</span></h5><hr>");
  						indiceScroll++;
  					}
  				} 
  			}
  		}
  	}); 
}

function formataPalavrasChaves(frase){

	for (var i = 0; i < frase.length; i++){
		frase = frase.replace("AND","");
		frase = frase.replace("OR","");
		frase = frase.replace("  ", " ");

	}

	return frase;
}

function formataURL(url){

	return encodeURI(url);

}

function divisaoScroll(resultado){

	var valorDivisaoPagina;


	if (resultado.hits.hits.length <= 100000){
		valorDivisaoPagina = 50;
		return valorDivisaoPagina;
	}
	
	if (resultado.hits.hits.length <= 10){
		valorDivisaoPagina = resultado.hits.hits.length;
		return valorDivisaoPagina;
	}  
}

function destacaPalavras(texto, palavrasChave){

	palavrasChave = palavrasChave.split(" ");

	for (var i = 0; i < palavrasChave.length; i++){
		texto = texto.toLowerCase().replace(palavrasChave[i].toLowerCase(),"<b>"+palavrasChave[i]+"</b>");

	}

	return texto;
}

function formataData(data) {

	data = data.split("T");
	data = data[0].split("-");
  	var meses = ["Janeiro", "Fevereiro", "Março","Abril", "Maio", "Junho", "Julho","Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];

  	return data[2] + ' de ' + meses[parseInt(data[1]) -1 ] + ' de ' + data[0];
}
