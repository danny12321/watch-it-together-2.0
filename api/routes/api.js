const express = require('express');
const router = express.Router();
const con = require('../db_con');
const sha1 = require('sha1');
const func = require('../functions')
const jwt = require('jsonwebtoken');
const auth = require('../auth')

router.post('/register', (req, res) => {
  func.idIsNotInUse('users', (id) => {
    const password = sha1(req.body.password)

    const sql = `
      INSERT INTO users(id, email, username, password)
      VALUES(
        AES_ENCRYPT('${id}', '${process.env.ENC_KEY}'),
        AES_ENCRYPT('${req.body.email}', '${process.env.ENC_KEY}'),
        AES_ENCRYPT('${req.body.username}', '${process.env.ENC_KEY}'),
        AES_ENCRYPT('${password}', '${process.env.ENC_KEY}')
      )`

    con.query(sql, (err, result, fields) => {
      if (err) throw err

      res.status(200).json('ok')
    })
  })
})

router.post('/login', (req, res) => {
  const sql = `
    SELECT
      CAST(AES_DECRYPT(id, '${process.env.ENC_KEY}') AS CHAR) as id,
      CAST(AES_DECRYPT(email, '${process.env.ENC_KEY}') AS CHAR) as email,
      CAST(AES_DECRYPT(username, '${process.env.ENC_KEY}') AS CHAR) as username,
      created_at
    FROM 
      users
    WHERE
      email = AES_ENCRYPT('${req.body.emailusername}', '${process.env.ENC_KEY}') AND password = AES_ENCRYPT('${sha1(req.body.password)}', '${process.env.ENC_KEY}')
    OR
      username = AES_ENCRYPT('${req.body.emailusername}', '${process.env.ENC_KEY}') AND password = AES_ENCRYPT('${sha1(req.body.password)}', '${process.env.ENC_KEY}')
    `

  con.query(sql, (err, result, fields) => {
    if (err) throw err
    if (!result[0]) res.status(400).json('no user found')
    else {
      getPlaylist(result[0].id).then(playlists => {
        result[0].playlists = playlists

        jwt.sign({ user: result[0] }, process.env.JWT_KEY, (err, token) => {
          if (err) throw err
          result[0].jwt = token
          res.status(200).json(result[0])
        })
      })
    }
  })
})

router.post('/createPlaylist', auth(), (req, res) => {
  const user_id = res.locals.user.id

  const sql = `
    INSERT INTO playlists(user_id, name, owner)
    VALUES(
      AES_ENCRYPT('${user_id}', '${process.env.ENC_KEY}'),
      AES_ENCRYPT('${req.body.name}', '${process.env.ENC_KEY}'),
      AES_ENCRYPT('${user_id}', '${process.env.ENC_KEY}')
    )
  `

  con.query(sql, (err, result, fields) => {
    if (err) throw err
    const video = req.body.video;

    const sqlVideo = `
      INSERT INTO videos(playlistId, videoId, name, channelTitle, description, img, addedBy)
      VALUES (
        '${result.insertId}',
        '${video.id.videoId}',
        '${video.snippet.title}',
        '${video.snippet.channelTitle}',
        '${video.snippet.description}',
        '${video.snippet.thumbnails.high.url}',
        AES_ENCRYPT('${user_id}', '${process.env.ENC_KEY}')
      )
    `

    con.query(sqlVideo, (err, result, fields) => {
      if (err) throw err
      getPlaylist(user_id).then(playlists => {
        res.status(200).json(playlists)
      })
    })
  })
})

router.post('/addtoplaylist', auth(), (req, res) => {
  const { video } = req.body
  const user_id = res.locals.user.id

  const sql = `
    INSERT INTO videos(playlistId, videoId, name, channelTitle, description, img, addedBy)
    VALUES (
      '${func.escapeHtml(req.body.playlist)}',
      '${func.escapeHtml(video.id.videoId)}',
      '${func.escapeHtml(video.snippet.title)}',
      '${func.escapeHtml(video.snippet.channelTitle)}',
      '${func.escapeHtml(video.snippet.description)}',
      '${video.snippet.thumbnails.high.url}',
      AES_ENCRYPT('${user_id}', '${process.env.ENC_KEY}')
    )`
  con.query(sql, (err, result, fields) => {
    if (err) throw err
    getPlaylist(user_id).then(playlists => {
      res.status(200).json(playlists)
    })
  })
})

function getPlaylist(user_id) {
  return new Promise((resolve, reject) => {
    const sql = `
      SELECT
        p.id,
        CAST(AES_DECRYPT(p.name, '${process.env.ENC_KEY}') AS CHAR) as name,
        CAST(AES_DECRYPT(u.username, '${process.env.ENC_KEY}') AS CHAR) as owner
      FROM 
        playlists as p,
        users as u
      WHERE
        p.user_id = AES_ENCRYPT('${user_id}', '${process.env.ENC_KEY}')
      AND
        u.id = p.user_id
        
      GROUP BY p.id`

    con.query(sql, (err, result, fields) => {
      if (err) throw err
      getVideos(result).then(res => {
        resolve(result)
      });
    })
  })
}

function getVideos(res) {
  return new Promise((resolve, reject) => {
    res.forEach((el, key) => {
      const vidSql = `
    SELECT
      v.videoId,
      v.name,
      v.channelTitle,
      v.description,
      v.img,
      CAST(AES_DECRYPT(u.username, '${process.env.ENC_KEY}') AS CHAR) as addedBy
    FROM
      videos as v,
      users as u
    WHERE
      v.playlistId = ${el.id}
    AND
      u.id = v.addedBy
    `
      con.query(vidSql, (err, result, fields) => {
        if (err) throw err
        res[key].videos = result
        if (key === res.length - 1) resolve(res);
      })
    })
  })
}

module.exports = router




