var Conexao = function(){ //objeto para configurar o caminho da instância do Elasticsearch.
	
	return {

		stringConexao  : "http://localhost:9200",

		getStringConexao: function(){ //método que retorna a string de conexão

			return this.stringConexao;
		},

		setStringConexao: function(novoServidor){
			this.stringConexao = novoServidor;
		}

	};
}