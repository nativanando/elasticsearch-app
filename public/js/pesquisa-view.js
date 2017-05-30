
$(document).ready(function() {
      //variáveis de controle para paginação
      var controleIndices = 0; //controla o indice que irá chamar os próximos requests
      var queryPaginacao; //salva a query que será paginada
      var pesquisaPaginacao; //salva a caracteristica da pesquisa que será paginada 
      //fim das variáveis de controle
      iniciaIndices();
      mascaraDatas();

});

function mascaraDatas(){ //configura a mascara dos inputs de data

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
  controleIndices = 0;
	pesquisa.setPesquisa(pesquisa);
	iniciaQuery(pesquisa, 0); //passa a primeira paginacao, começando em 0

});

$("#content").scroll(function() { //scroll que será utilizado para ir requisitando os próximos resultados
  if ($(this).scrollTop() + $(this).height() == $(this).get(0).scrollHeight) {
    controleIndices = controleIndices + 10;
    executaBuscaPaginada(controleIndices, queryPaginacao, pesquisaPaginacao) //chama o método para passando as variáveis de controle de paginação
  }
});


function formataPosts(resultado, pesquisa, query){ //formata os resultados iniciais

  $('#posts').empty();
  $("#content").scrollTop();

  //Ajusta as configurações iniciais de paginãção, passando a query, pesquisa e zerando o controle dos índices que serão manipulados
  queryPaginacao = query;
  pesquisaPaginacao = pesquisa;
  controleIndices = 0;
  //fim das configurações.

	var palavrasChave = formataPalavrasChaves(pesquisa.frase);

	if (resultado.hits.hits.length == 0){ //se não encontrar nenhum resultado na pesquisa, retorna uma mensagem de busca invalida!
     	$("#posts").append("<h4><center><b>Nehum resultado encontrado</b></center></h4>");

  		return 0;
	}

	for (var i = 0; i < resultado.hits.hits.length; i++){ //varre e redenriza os resultados da pesquisa inicial (os 10 primeiros resultados)
		
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



function paginacaoResultados(resultado, pesquisa, query){ //formata os resultados conforma a requisição de mais resultados, através do scroll

  var palavrasChave = formataPalavrasChaves(pesquisa.frase);

  if (resultado.hits.hits.length == 0){ //se não houver mais resultados, quer dizer que a paginação chegou ao fim dos resultados, saindo da função

      return 0;
  }

  for (var i = 0; i < resultado.hits.hits.length; i++){ //varre e renderiza os resultados da paginação (os próximos 10)
   
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


function formataData(data) {

	data = data.split("T");
	data = data[0].split("-");
  	var meses = ["Janeiro", "Fevereiro", "Março","Abril", "Maio", "Junho", "Julho","Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];

  	return data[2] + ' de ' + meses[parseInt(data[1]) -1 ] + ' de ' + data[0];
}
