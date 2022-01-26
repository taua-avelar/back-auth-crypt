const express = require("express");
const {
  listarPokemons,
  buscarPokemon,
  cadastrarPokemon,
  atualizarApelidoPokemon,
  excluirPokemon,
} = require("./controllers/pokemons");

const { cadastrarUsuario, loginUsuario } = require("./controllers/usuarios");

const router = express();

router.post("/cadastrar", cadastrarUsuario);
router.post("/login", loginUsuario);

router.get("/pokemons", listarPokemons);
router.get("/pokemons/:id", buscarPokemon);
router.post("/pokemons", cadastrarPokemon);
router.patch("/pokemons/:id", atualizarApelidoPokemon);
router.delete("pokemons/:id", excluirPokemon);

module.exports = router;
