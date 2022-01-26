const securePassword = require("secure-password");
const conexao = require("../conexao");
const jwt = require("jsonwebtoken");
const jwtSenha = require("../jwt-senha");

const pwd = securePassword();

const cadastrarUsuario = async (req, res) => {
  const { nome, email, senha } = req.body;

  if (!nome) return res.status(400).json("Campo nome é obrigatorio");
  if (!email) return res.status(400).json("Campo email é obrigatorio");
  if (!senha) return res.status(400).json("Campo senha é obrigatorio");

  try {
    const { rowCount } = await conexao.query(
      "select * from usuarios where email = $1",
      [email]
    );
    if (rowCount) return res.status(400).json("Email já cadastrado");
  } catch (error) {
    return res.status(400).json(error.message);
  }

  try {
    const hash = (await pwd.hash(Buffer.from(senha))).toString("hex");
    const { rowCount } = await conexao.query(
      "insert into usuarios(nome, email, senha) values($1, $2, $3)",
      [nome, email, hash]
    );
    !rowCount && res.status(400).json("Erro ao cadastrar");
    return res.json("Usuario cadastrado");
  } catch (error) {
    return res.status(400).json(error.message);
  }
};
const loginUsuario = async (req, res) => {
  const { email, senha } = req.body;

  if (!email) return res.status(400).json("Campo email é obrigatorio");
  if (!senha) return res.status(400).json("Campo senha é obrigatorio");

  try {
    const { rowCount, rows } = await conexao.query(
      "select * from usuarios where email = $1",
      [email]
    );
    if (!rowCount) return res.status(400).json("Email ou Senha incorretos.");

    const usuario = rows[0];

    const result = await pwd.verify(
      Buffer.from(senha),
      Buffer.from(usuario.senha, "hex")
    );

    switch (result) {
      case securePassword.INVALID_UNRECOGNIZED_HASH:
      case securePassword.INVALID:
        return res.status(400).json("Email ou Senha incorretos.");
      case securePassword.VALID:
        break;
      case securePassword.VALID_NEEDS_REHASH:
        try {
          const novoHash = (
            await pwd.hash(Buffer.from(usuario.senha))
          ).toString("hex");
          conexao.query("update usuarios set senha = $1 where email = $2", [
            novoHash,
            email,
          ]);
        } catch {}
        break;
    }

    const token = jwt.sign(
      {
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email,
      },
      jwtSenha
    );
    return res.send(token);
  } catch (error) {
    return res.status(400).json(error.message);
  }
};

module.exports = {
  cadastrarUsuario,
  loginUsuario,
};
