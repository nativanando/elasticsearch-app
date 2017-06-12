//objeto para configurar o caminho da instância do Elasticsearch.

var Conexao = function(){
	
	return {

		conexao  : "http://localhost:9200",

		getStringConexao: function(){
			return this.conexao;
		},

		setStringConexao: function(novoServidor){
			this.conexao = novoServidor;
		}
	};
}