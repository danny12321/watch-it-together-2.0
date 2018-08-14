const con = require('./db_con')

const functions = {
  makeId: () => {
    let text = "";
    let possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for (let i = 0; i < 10; i++) {
      text += possible.charAt(Math.floor(Math.random() * possible.length));
    }

    return text;
  },

  idIsNotInUse: (table, callback) => {
    let id = functions.makeId();

    con.query(`SELECT * FROM ${table} WHERE id = AES_ENCRYPT('${id}', '${this.SECRET_KEY}')`, (err, result, fields) => {
      if (typeof result === 'undefined') { callback(id); return; }
      if (result[0]) { this.idIsNotInUse(table, callback); }
      else callback(id);
    })
  },

  escapeHtml: string => {
    let entityMap = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '"',
      "'": "''",
      '/': '&#x2F;',
      '`': '&#x60;',
      '=': '&#x3D;'
    }

    return String(string).replace(/[&<>"'`=\/]/g, s => {
      return entityMap[s];
    });
  },
}

module.exports = functions