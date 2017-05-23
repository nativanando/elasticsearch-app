
$(document).ready(function() {

      iniciaIndices();
      mascaraDatas();

});


function mascaraDatas(){

  $("#dataInicial").mask('00/00/0000');
  $("#dataFinal").mask('00/00/0000');

  $('#dataInicial').datepicker({
      dateFormat: 'dd/mm/yy'
	});

  $('#dataFinal').datepicker({
      dateFormat: 'dd/mm/yy'
	});

}


$("#formulario").submit(function(e) {

	var pesquisa = new Pesquisa();
	pesquisa.setPesquisa(pesquisa);
	iniciaQuery(pesquisa);

});


function formataPosts(resultado, frase){

	$("#content").scrollTop();
    $('#posts').empty();
	var controlePaginacao = divisaoScroll(resultado);
	var palavrasChave = formataPalavrasChaves(frase);
	var indiceScroll = 0;
	console.log(resultado);	

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
            	indiceScroll = indiceScroll + controlePaginacao;
            	for (var i  = indiceScroll; i < (indiceScroll + controlePaginacao); i++){
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
  			}
  		}
  	});
} 


function divisaoScroll(resultado){

	var valorDivisaoPagina;

	if (resultado.hits.hits.length <= 100000){
		valorDivisaoPagina = 10;
		return valorDivisaoPagina;
	}
	
	if (resultado.hits.hits.length <= 10){
		valorDivisaoPagina = resultado.hits.hits.length;
		return valorDivisaoPagina;
	}  
}


function formataData(data) {

	data = data.split("T");
	data = data[0].split("-");
  	var meses = ["Janeiro", "Fevereiro", "Março","Abril", "Maio", "Junho", "Julho","Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];

  	return data[2] + ' de ' + meses[parseInt(data[1]) -1 ] + ' de ' + data[0];
}
