const express = require('express');
const mysql = require('mysql');
const jwt = require('jsonwebtoken');
const app = express();
const port = 3000;
app.use(express.json());
require('dotenv').config()


var con = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'dbloja',
});

con.connect((erroConexao) => {
    if (erroConexao) {
        throw erroConexao;
    }
});

app.post('/login', (req, res) => {
  const codigo = req.body.codigo;
  const nomecliente = req.body.nomecliente;
  const sql = 'SELECT * FROM tbusuario WHERE coCodigo = ? AND nome = ?';
  con.query(sql, [codigo, nomecliente], (erroComandoSQL, result, fields) => {
    if (erroComandoSQL) {
      throw erroComandoSQL;
    } else {
      if (result.length > 0) {
          const token = jwt.sign({ codigo, nomecliente }, process.env.SENHA, {
          expiresIn: 60 * 10, // expires in 5min (300 segundos ==> 5 x 60)
        });
        res.json({ auth: true, token: token });
      } else {
        res.status(403).json({ message: 'Login inválido!' });
      }
    }
  });
});
  
function verificarToken(req, res, next) {
    const token = req.headers['x-access-token'];
    if (!token) {
      res.status(401).json({
        auth: false,
        message: 'Nenhum token de autenticação informado.',
      });
    } else {
      jwt.verify(token, process.env.SENHA, function (err, decoded) {
        if (err) {
          res.status(500).json({ auth: false, message: 'Token inválido.' });
        } else {
          console.log('Metodo acessado por ' + decoded.nomecliente);
          next();
        }
      });
    }
}

app.get('/cliente', verificarToken, (req, res) => {
    con.query('SELECT * FROM tbusuario', (erroComandoSQL, result, fields) => {
        if (erroComandoSQL) {
            throw erroComandoSQL;
        }
        res.status(200).send(result);
    });
});

app.get('/cliente/:id', verificarToken, (req, res) => {
    const codigoCliente = req.params.id;
    const sql = 'SELECT * FROM tbusuario WHERE coCodigo = ?';
    con.query(sql, [codigoCliente, ], (erroComandoSQL, result, fields) => {
        if (erroComandoSQL) {
            throw erroComandoSQL;
        }

        if (result.length > 0) {
            res.status(200).send(result);
        }
        else {
            res.status(404).send('Não encontrado');
        }
    });
});

app.post('/cliente', (req, res) => {
    const nomecliente = req.body.nomecliente;
    const email = req.body.email;
    const senha = req.body.senha

    const sql = 'INSERT INTO tbusuario (nome, email, senha) VALUES(?,?,?)';
    con.query(sql, [nomecliente, email, senha], (erroComandoSQL, result, fields) => {
        if (erroComandoSQL) {
            throw erroComandoSQL;
        }

        if (result.affectedRows > 0) {
            res.status(200).send('Registro incluido com sucesso!');
        }
        else {
            res.status(404).send('Erro ao incluir o registro');
        }
    });
});

app.put('/cliente/:id', verificarToken, (req, res) => {
    const codigo = req.params.id;
    const nomecliente = req.body.nomecliente;
    const email = req.body.email;
    const senha = req.body.senha

    const sql = 'UPDATE tbusuario SET nome = ?, email = ?, senha = ? WHERE coCodigo = ?';
    con.query(sql, [nomecliente, email, senha, codigo], (erroUpdate, result) => {
        if (erroUpdate) {
            throw erroUpdate;
        }

        if (result.affectedRows > 0) {
            res.status(200).send('Registro atualizado com sucesso!');
        }
        else {
            res.status(404).send('Registro não encontrado');
        }
    });

});

app.delete('/cliente/:id', verificarToken, (req, res) => {
    const codigo = req.params.id;
    const sql = 'DELETE FROM tbusuario WHERE coCodigo = ?';
    con.query(sql, [codigo], (erroComandoSQL, result, fields) => {
      if (erroComandoSQL) {
        throw erroComandoSQL;
      }
      
      if (result.affectedRows > 0) {
        res.status(200).send('Registro excluído com sucesso');
      }
      else {
        res.status(404).send('Não encontrado');
      }
    });
});

app.get('/pedido', verificarToken,(req, res) => {
  con.query('SELECT * FROM tbpedido', (erroComandoSQL, result, fields) => {
      if (erroComandoSQL) {
          throw erroComandoSQL;
      }
      res.status(200).send(result);
  });
});

app.get('/pedido/:id', verificarToken, (req, res) => {
  const codigoPedido = req.params.id;
  const sql = 'SELECT * FROM vwpedidocliente WHERE idPedido = ?';
  con.query(sql, [codigoPedido, ], (erroComandoSQL, result, fields) => {
      if (erroComandoSQL) {
          throw erroComandoSQL;
      }

      if (result.length > 0) {
          res.status(200).send(result);
      }
      else {
          res.status(404).send('Não encontrado');
      }
  });
});

app.post('/pedido', verificarToken, (req, res) => {
  const codigocliente = req.body.coCliente;
  const dtpedido = req.body.dtpedido;
  const vatotal = req.body.vatotal;
  const status = req.body.status;
  const pago = req.body.pago;
  const sql = 'INSERT INTO tbpedido (coCodigo, dtpedido, vatotal, status, pago) VALUES(?,?,?,?,?)';
  con.query(sql, [codigocliente,dtpedido, vatotal, status, pago], (erroComandoSQL, result, fields) => {
      if (erroComandoSQL) {
          throw erroComandoSQL;
      }

      if (result.affectedRows > 0) {
          res.status(200).send('Registro incluido com sucesso!');
      }
      else {
          res.status(404).send('Erro ao incluir o registro');
      }
  });
});

app.put('/pedido/:id', verificarToken, (req, res) => {
  const codigo = req.params.id;
  const vatotal = req.body.vatotal;
  const status = req.body.status;
  const pago = req.body.pago;

  const sql = 'UPDATE tbpedido SET vaTotal = ?, status = ?, pago = ? WHERE coCodigo = ?';
  con.query(sql, [vatotal, status, pago, codigo], (erroUpdate, result) => {
      if (erroUpdate) {
          throw erroUpdate;
      }

      if (result.affectedRows > 0) {
          res.status(200).send('Registro atualizado com sucesso!');
      }
      else {
          res.status(404).send('Registro não encontrado');
      }
  });

});

app.delete('/pedido/:id', verificarToken, (req, res) => {
  const codigo = req.params.id;
  const sql = 'DELETE FROM tbpedido WHERE idPedido = ?';
  con.query(sql, [codigo], (erroComandoSQL, result, fields) => {
    if (erroComandoSQL) {
      throw erroComandoSQL;
    }
    
    if (result.affectedRows > 0) {
      res.status(200).send('Registro excluído com sucesso');
    }
    else {
      res.status(404).send('Não encontrado');
    }
  });
});


app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
});