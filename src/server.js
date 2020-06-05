const express = require("express");
const server = express();

// Pegar o banco de dados
const db = require("./database/db");

//  Configurar pasta pública
server.use(express.static("public"));

// Habilitar o uso do req.body
server.use(express.urlencoded({ extended: true }))

// Utilizando template engines
const nunjucks = require("nunjucks");
nunjucks.configure("src/views", {
  express: server,
  noCache: true
});

//  Configurar caminhos da minha aplicação
//  Página inicial
server.get("/", (request, response) => {
  return response.render("index.html", {
  title: "Título"
  });
});

server.get("/create-point", (request, response) => {
  // request.query: Query Strings da url
  // console.log(request.query)
  
  return response.render("create-point.html");
});

server.post("/save-point", (req, res) => {
  // req.body: O corpo do nosso formulário
  // console.log(req.body)

  // Inserir dados no banco de dados
  const query = `
    INSERT INTO places (
      image,
      name,
      address,
      address2,
      state,
      city,
      items
    ) VALUES (?,?,?,?,?,?,?);
  `
  const values = [
    req.body.image,
    req.body.name,
    req.body.address,
    req.body.address2,
    req.body.state,
    req.body.city,
    req.body.items
  ];

  function afterInsertData(err) {
    if(err) {
      console.log(err)
      return res.render("create-point.html", { error: true })
    }
    console.log("Cadastrado com sucesso");
    console.log(this);
    return res.render("create-point.html", { saved: true })
  };

  db.run(query, values, afterInsertData);
})

server.get("/search", (request, response) => {
  const search = request.query.search

  if(search == "") {
    // Pesquisa vazia
    return response.render("search-results.html", { total: 0 });
  }

  // Pegar os dados do banco de dados
  db.all(`SELECT * FROM places WHERE city LIKE '%${search}%'`, function(err, rows) {
    if(err) {
      return console.log(err)
    };
    const total = rows.length
    // Mostrar a página html com os dados do banco de dados
    return response.render("search-results.html", { places: rows, total });
  });
});




//  Ligar o servidor
server.listen(3000)