//objeto para configurar o caminho da instância do Elasticsearch.

var Conexao = function(){
	
	return {

		stringConexao  : "http://localhost:9200",

		getStringConexao: function(){

			return this.stringConexao;
		},

		setStringConexao: function(novoServidor){
			this.stringConexao = novoServidor;
		}

	};
}