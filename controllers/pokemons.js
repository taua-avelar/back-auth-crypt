const conexao = require("../conexao");
const jwt = require("jsonwebtoken");
const jwtSenha = require("../jwt-senha");

const listarPokemons = async (req, res) => {
  const { token } = req.body;
  if (!token) return res.status(400).json("Campo token obrigatorio.");

  try {
    const usuario = jwt.verify(token, jwtSenha);
    console.log(`${usuario.nome} abriu a lista de pokemons`);
  } catch {
    return res.status(400).json("Token invalido");
  }

  try {
    const { rows } = await conexao.query("select * from pokemons");
    const listagemPokemons = rows.map((pokemon) => {
      const arrHabilidades = pokemon.habilidades.split(",");
      return { ...pokemon, habilidades: arrHabilidades };
    });
    return res.json(listagemPokemons);
  } catch (error) {
    return res.status(400).json(error.message);
  }
};
const buscarPokemon = async (req, res) => {
  const { id } = req.params;
  const { token } = req.body;
  if (!token) return res.status(400).json("Campo token obrigatorio.");

  try {
    const usuario = jwt.verify(token, jwtSenha);
    console.log(`${usuario.nome} fez uma busca por pokemon`);
  } catch {
    return res.status(400).json("Token invalido");
  }

  try {
    const { rowCount, rows } = await conexao.query(
      "select * from pokemons where id = $1",
      [id]
    );
    if (!rowCount) return res.status(404).json("Pokemon não encontrado");

    const pokemon = rows[0];
    return res.json(pokemon);
  } catch (error) {
    return res.status(400).json(error.message);
  }
};
const cadastrarPokemon = async (req, res) => {
  const { nome, habilidades, imagem, apelido, token } = req.body;
  let usuario_id = null;
  if (!nome) return res.status(400).json("Campo nome obrigatorio.");
  if (!habilidades)
    return res.status(400).json("Campo habilidades obrigatorio.");
  if (!token) return res.status(400).json("Campo token obrigatorio.");

  try {
    const usuario = jwt.verify(token, jwtSenha);
    usuario_id = usuario.id;
    console.log(`${usuario.nome} esta cadastrando um pokemon`);
  } catch {
    return res.status(400).json("Token invalido");
  }

  try {
    const { rowCount } = await conexao.query(
      "insert into pokemons(usuario_id, nome, habilidades, imagem, apelido) values($1, $2, $3, $4, $5)",
      [usuario_id, nome, habilidades, imagem, apelido]
    );
    if (!rowCount) {
      console.log("Falha ao cadastrar.");
      return res.status(400).json("Não foi possivel cadastrar o pokemon");
    }
    console.log("Sucesso ao cadastrar.");
    return res.json("Pokemon cadastrado com sucesso");
  } catch (error) {}
};
const atualizarApelidoPokemon = async (req, res) => {
  const { id } = req.params;
  const { apelido, token } = req.body;
  if (!token) return res.status(400).json("Campo token obrigatorio.");

  try {
    const usuario = jwt.verify(token, jwtSenha);
    console.log(`${usuario.nome} esta alterando apelido de um pokemon`);
  } catch {
    return res.status(400).json("Token invalido");
  }

  try {
    const { rowCount } = await conexao.query(
      "update pokemons set apelido = $1 where id = $2",
      [apelido, id]
    );
    if (!rowCount) {
      console.log("Falha ao trocar apelido");
      return res.status(400).json("Erro ao alterar apelido");
    }
    console.log("Sucesso ao trocar apelido");
    res.json("Apelido alterado com sucesso");
  } catch (error) {
    res.status(400).json(error.message);
  }
};
const excluirPokemon = async (req, res) => {
  const { id } = req.params;
  const { token } = req.body;
  if (!token) return res.status(400).json("Campo token obrigatorio.");

  try {
    const usuario = jwt.verify(token, jwtSenha);
    console.log(`${usuario.nome} esta excluindo um pokemon`);
  } catch {
    return res.status(400).json("Token invalido");
  }

  try {
    const { rowCount } = await conexao.query(
      "delete from pokemons where id = $1",
      [id]
    );
    if (!rowCount) {
      console.log("Falha ao excluir");
      return res
        .status(400)
        .json("Houve um problema ao tentar apagar o pokemon.");
    }
    console.log("Sucesso ao excluir");
    return res.json();
  } catch (error) {
    return res.status(400).json(error.message);
  }
};

module.exports = {
  listarPokemons,
  buscarPokemon,
  cadastrarPokemon,
  atualizarApelidoPokemon,
  excluirPokemon,
};
