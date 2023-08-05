const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const connection = require("./server/database/db");
const API_LOGIN_REGISTER = require("./server/API/apiLoginRegister");
const API_PRODUCT = require("./server/API/apiProduct");
const app = express();
const multipart = require("connect-multiparty");
const apiReport = require("./server/API/apiReport");
const cloudinary = require("cloudinary").v2;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());
app.use(multipart());

// START REGISTER

app.get("/", (req, res) => {
  res.send("Selamat Datang di API Cashier");
});

app.post("/register", (req, res) => {
  const { username, email, password, alamat, nama_cafe } = req.body;

  const querySQLCreateTableProductCashier = `CREATE TABLE product_${username} (
    id int NOT NULL AUTO_INCREMENT,
    kategori_produk varchar(20) DEFAULT NULL,
    kode_produk varchar(10) DEFAULT NULL,
    nama_produk varchar(35) DEFAULT NULL,
    harga_produk int DEFAULT NULL,
    stok_produk int DEFAULT NULL,
    gambar_produk varchar(100) DEFAULT NULL,
    id_gambar_produk varchar(35) DEFAULT NULL,
    createdAt datetime DEFAULT CURRENT_TIMESTAMP,
    updatedAt datetime DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id)
  );`;

  const querySQLCreateTableReportSales = `CREATE TABLE laporan_penjualan_${username} (
    id int NOT NULL AUTO_INCREMENT,
    id_produk int DEFAULT NULL,
    nomor_pesanan varchar(20) DEFAULT NULL,
    no_meja_pelanggan int DEFAULT NULL,
    nama_pelanggan varchar(20) DEFAULT NULL,
    kode_produk varchar(10) DEFAULT NULL,
    kategori_produk varchar(20) DEFAULT NULL,
    nama_produk varchar(30) DEFAULT NULL,
    terjual int DEFAULT NULL,
    harga_produk int DEFAULT NULL,
    metode_pembayaran varchar(25) DEFAULT NULL,
    tanggal_penjualan datetime DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id)
  );`;

  const querySQLInsertDataLoginRegisterCashierApp = `INSERT INTO login_register_cashier (username, email, password, alamat, nama_cafe) VALUES ('${username}', '${email}', '${password}', '${alamat}', '${nama_cafe}'); SET @num := 0; UPDATE login_register_cashier SET id = @num  := (@num + 1); ALTER TABLE login_register_cashier AUTO_INCREMENT = 1;`;

  connection.query(querySQLInsertDataLoginRegisterCashierApp, (err, result) => {
    if (err) {
      res.json({
        message: `Gagal registrasi akun dengan username ${username}, kemungkinan username ${username} sudah ada. silahkan ganti username username anda dan coba lagi`,
      });
    } else {
      connection.query(querySQLCreateTableProductCashier, (err, result) => {
        if (err) {
          res.json({
            message: `Gagal membuat tabel produk dari nama user  = ${username}`,
          });
        } else {
          connection.query(querySQLCreateTableReportSales, (err, result) => {
            if (err) {
              res.json({
                message: "Gagal membuat tabel laporan penjualan",
              });
            } else {
              API_LOGIN_REGISTER(200, result, "Berhasil Register!", res);
            }
          });
        }
      });
    }
  });
});
// END REGISTER

// START LOGIN
app.post("/login", (req, res) => {
  const { username, password } = req.body;

  const querySQL = `SELECT * FROM login_register_cashier WHERE username = '${username}' AND password = '${password}';`;

  connection.query(querySQL, (err, result) => {
    if (err) {
      res.json({
        status_code: 500,
        message: err,
      });
    } else {
      if (result.length === 0) {
        res.json({
          status_code: 500,
          message: "wrong",
        });
      } else {
        const data = {
          username: result[0]?.username,
          email: result[0]?.email,
          alamat: result[0]?.alamat,
          nama_cafe: result[0]?.nama_cafe,
          status_code: 200,
        };

        API_LOGIN_REGISTER(200, data, "Berhasil Login!", res);
      }
    }
  });
});
// END LOGIN

// GET PRODUK
app.get("/product", (req, res) => {
  const { username } = req.query;

  const querySQL = `SELECT * FROM product_${username}`;
  // const querySQL = `SELECT * FROM product_${username}`;

  connection.query(querySQL, (err, result) => {
    if (err) {
      console.log(result);
      res.json({ message: "Gagal Menampilkan Data Produk" });
    } else {
      API_PRODUCT(200, result, "Berhasil Get Data!", res);
    }
  });
});

// TAMBAH PRODUK
app.post("/product/add-product", (req, res) => {
  const {
    kategori_produk,
    kode_produk,
    nama_produk,
    harga_produk,
    stok_produk,
    username,
  } = req.body;

  let gambar_produk;

  if (req.files && req.files.gambar_produk) {
    gambar_produk = req.files.gambar_produk;
  }

  if (gambar_produk == undefined) {
    res.json({
      message: "gambar yang anda masukan tidak ada, harap periksa kembali.",
    });
  } else {
    cloudinary.config({
      cloud_name: "deggre5zj",
      api_key: 969382978846558,
      api_secret: "k89khdDG4-l0dgVaWWMftoamuoQ",
    });

    (async function run() {
      const result = await cloudinary.uploader.upload(gambar_produk.path, {
        upload_preset: "cashierapp",
      });

      const querySQLInsert = `INSERT INTO product_${username} (kategori_produk, kode_produk, nama_produk, harga_produk, stok_produk, gambar_produk, id_gambar_produk) VALUES ('${kategori_produk}', '${kode_produk}', '${nama_produk}', '${harga_produk}', '${stok_produk}', '${result.url}', '${result.public_id}');`;

      connection.query(querySQLInsert, (err, result) => {
        if (err) {
          res.json({ message: "Gagal tambah data!", result: err });
        } else {
          res.json({
            message: "Berhasil tambah data product!",
            result: result,
          });
        }
      });
    })();
  }
});

// UPDATE PRODUK
app.patch("/product/update-product", (req, res) => {
  const {
    id,
    kategori_produk,
    kode_produk,
    nama_produk,
    harga_produk,
    stok_produk,
    username,
  } = req.body;

  let gambar_produk;

  if (req.files && req.files.gambar_produk) {
    gambar_produk = req.files.gambar_produk;
  }

  if (gambar_produk == undefined) {
    const querySqlUpdate = `UPDATE product_${username} SET kategori_produk = '${kategori_produk}', kode_produk = '${kode_produk}', nama_produk = '${nama_produk}', harga_produk = ${harga_produk}, stok_produk = ${stok_produk} WHERE id = ${id}`;

    connection.query(querySqlUpdate, (err, result) => {
      if (err) {
        res.json({ message: "Gagal update data!" });
      } else {
        res.json({ message: "Berhasil update data!" });
      }
    });
  } else {
    cloudinary.config({
      cloud_name: "deggre5zj",
      api_key: 969382978846558,
      api_secret: "k89khdDG4-l0dgVaWWMftoamuoQ",
    });

    (async function run() {
      const querySqlSelectIdGambarProduct = `SELECT id_gambar_produk FROM product_${username} WHERE id = ${id};`;

      connection.query(querySqlSelectIdGambarProduct, async (err, results) => {
        if (err) {
          res.json({ message: "Gagal select id_gambar_produk" });
        } else {
          const id_gambar_produk = results[0].id_gambar_produk;
          await cloudinary.uploader.destroy(id_gambar_produk);

          const result = await cloudinary.uploader.upload(gambar_produk.path, {
            upload_preset: "cashierapp",
          });

          const querySqlUpdate = `UPDATE product_${username} SET kategori_produk = '${kategori_produk}', kode_produk = '${kode_produk}', nama_produk = '${nama_produk}', harga_produk = ${harga_produk}, stok_produk = ${stok_produk}, gambar_produk = '${result.url}', id_gambar_produk = '${result.public_id}' WHERE id = ${id}`;

          connection.query(querySqlUpdate, (err, result) => {
            if (err) {
              res.json({ message: "Gagal update data!" });
            } else {
              res.json({ message: "Berhasil update data!" });
            }
          });
        }
      });
    })();
  }
});

app.delete("/product/delete-produk/:id", (req, res) => {
  const { id } = req.params;
  const { username } = req.query;

  const querySQLDelete = `DELETE FROM product_${username} WHERE id = ${id};`;
  const querySqlSelectIdGambarProduct = `SELECT id_gambar_produk FROM product_${username};`;
  connection.query(querySqlSelectIdGambarProduct, async (err, resultSelect) => {
    if (err) {
      res.json({ message: "Gagal menghapus produk id_gambar_produk" });
    } else {
      connection.query(querySQLDelete, async (err, result) => {
        if (err) {
          res.json({ message: "Gagal Hapus Produk" });
        } else {
          const id_gambar_produk = resultSelect[0].id_gambar_produk;

          await cloudinary.uploader.destroy(id_gambar_produk);
          res.json({ message: "Berhasil Hapus Produk!" });
        }
      });
    }
  });
});

// LAPORAN PENJUALAN
app.post("/product/laporan-penjualan", (req, res) => {
  const {
    id_produk,
    nomor_pesanan,
    no_meja_pelanggan,
    nama_pelanggan,
    kode_produk,
    kategori_produk,
    nama_produk,
    terjual,
    harga_produk,
    metode_pembayaran,
  } = req.body;

  const { username } = req.query;

  const querySQLInsertSalesReport = `INSERT INTO laporan_penjualan_${username} (id_produk, nomor_pesanan, no_meja_pelanggan, nama_pelanggan, kode_produk, kategori_produk, nama_produk, terjual, harga_produk, metode_pembayaran) VALUES ('${id_produk}', '${nomor_pesanan}', '${no_meja_pelanggan}', '${nama_pelanggan}', '${kode_produk}' ,'${kategori_produk}', '${nama_produk}', '${terjual}', '${harga_produk}', '${metode_pembayaran}')`;
  const querySQLUpdateStockProduct = `UPDATE product_${username} SET stok_produk = stok_produk - ${terjual} WHERE id = ${id_produk}`;

  connection.query(querySQLInsertSalesReport, (err, result) => {
    if (err) {
      res.status(500).json({
        message: "Gagal Memasukan data Ke Laporan Penjualan",
        result: result,
      });
    } else {
      connection.query(querySQLUpdateStockProduct, (err, result) => {
        if (err) {
          res.json({
            message: `Gagal Update stok produk dengan nama produk ${nama_produk}`,
            result: result,
          });
        } else {
          res.json({
            message: `Berhasil Memasukan data ke Laporan Penjualan dan Update Stok produk`,
            result: result,
          });
        }
      });
    }
  });
});

app.get("/product/laporan-harian", (req, res) => {
  const { username } = req.query;

  const querySQLGetAllWeekReport = `  SELECT * FROM laporan_penjualan_${username} WHERE DATE(tanggal_penjualan) = CURDATE();`;

  connection.query(querySQLGetAllWeekReport, (err, result) => {
    if (err) {
      res.status(500).json({
        message: `Gagal menampilkan laporan penjualan mingguan!`,
        result: result,
      });
    } else {
      apiReport(
        200,
        result,
        "Berhasil menampilkan laporan penjualan mingguan!",
        res
      );
    }
  });
});

app.get("/product/laporan-mingguan", (req, res) => {
  const { username } = req.query;

  const querySQLGetAllWeekReport = `SELECT * FROM laporan_penjualan_${username} WHERE tanggal_penjualan >= DATE_SUB(CURDATE(), INTERVAL 1 WEEK);`;

  connection.query(querySQLGetAllWeekReport, (err, result) => {
    if (err) {
      res.status(500).json({
        message: `Gagal menampilkan laporan penjualan mingguan!`,
        result: result,
      });
    } else {
      apiReport(
        200,
        result,
        "Berhasil menampilkan laporan penjualan mingguan!",
        res
      );
    }
  });
});

app.get("/product/laporan-bulanan", (req, res) => {
  const { username } = req.query;

  const querySQLGetAllMonthReport = `SELECT * FROM laporan_penjualan_${username} WHERE MONTH(tanggal_penjualan) = MONTH(CURDATE());`;

  connection.query(querySQLGetAllMonthReport, (err, result) => {
    if (err) {
      res.status(500).json({
        message: `Gagal menampilkan laporan penjualan bulanan!`,
        result: result,
      });
    } else {
      apiReport(
        200,
        result,
        "Berhasil menampilkan laporan penjualan bulanan!",
        res
      );
    }
  });
});

app.get("/product/laporan-keseluruhan", (req, res) => {
  const { username } = req.query;
  const querySQLGetAllReport = `SELECT * FROM laporan_penjualan_${username};`;

  connection.query(querySQLGetAllReport, (err, result) => {
    if (err) {
      res.status(500).json({
        message: `Gagal menampilkan laporan keseluruhan!`,
        result: result,
      });
    } else {
      apiReport(200, result, "Berhasil menampilkan laporan keseluruhan!", res);
    }
  });
});

app.listen(3100, () => {
  console.log("Server Berjalan di localhost:3100");
});
