const express = require('express');
const cors = require('cors');
const pg = require('pg');

const { Pool } = pg;
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://bahqfjhypoxhpyseedwt.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJhaHFmamh5cG94aHB5c2VlZHd0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjcwODI0OTEsImV4cCI6MjA0MjY1ODQ5MX0.sYlILsxJMeo6uVjz15q6VfkCEAH5vxSavkyygF_mNbo';
const supabase = createClient(supabaseUrl, supabaseKey);

const app = express();
app.use(cors());
app.use(express.json());

const pool = new Pool({
  user: 'postgres.bahqfjhypoxhpyseedwt',
  host: 'aws-0-ap-southeast-1.pooler.supabase.com',
  database: 'postgres',
  password: 'lpj-table-db',
  port: 6543,
  ssl: { rejectUnauthorized: false }
});

app.get('/api/riset-pengembangan', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM riset_pengembangan');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/dashboard', async (req, res) => {
  try {
    const dashboardResult = await pool.query(`
    SELECT d.*, 
        json_agg(json_build_object(
          'id', dd.id,
          'dashboard_id', dd.dashboard_id,
          'bulan_berjalan', dd.bulan_berjalan,
          'progress', dd.progress,
          'capaian', dd.capaian,
          'kendala_mitigasi', dd.kendala_mitigasi,
          'rencana_tindak_lanjut', dd.rencana_tindak_lanjut,
          'komersialisasi_produk', dd.komersialisasi_produk,
          'monetisasi', dd.monetisasi,
          'realisasi_anggaran_biaya', dd.realisasi_anggaran_biaya,
          'no_triwulan', dd.no_triwulan
        ) ORDER BY dd.no_triwulan) AS detail
    FROM dashboard d
    LEFT JOIN dashboard_detail dd ON d.id = dd.dashboard_id
    GROUP BY d.id 
    `);
    res.json(dashboardResult.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST endpoint
app.post('/api/dashboard', async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const {
      email_address, entitas_perusahaan, divisi, jumlah_kegiatan_riset,
      aspirasi_tema, aspirasi_tema_lain, sektor_bisnis, kategori_portofolio,
      kategori_bumn, proyeksi_mulai, proyeksi_selesai, deskripsi_singkat,
      output, tingkat_kesiapan_teknologi, sifat, rencana_anggaran_biaya,
      dampak_potensi_dampak, dampak_lain, mitra, keterangan, detail
    } = req.body;
    
    // Insert dashboard data
    const dashboardResult = await client.query(
      `INSERT INTO dashboard (
        email_address, entitas_perusahaan, divisi, jumlah_kegiatan_riset,
        aspirasi_tema, aspirasi_tema_lain, sektor_bisnis, kategori_portofolio,
        kategori_bumn, proyeksi_mulai, proyeksi_selesai, deskripsi_singkat,
        output, tingkat_kesiapan_teknologi, sifat, rencana_anggaran_biaya,
        dampak_potensi_dampak, dampak_lain, mitra, keterangan
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20) 
      RETURNING id`,
      [email_address, entitas_perusahaan, divisi, jumlah_kegiatan_riset,
       aspirasi_tema, aspirasi_tema_lain, sektor_bisnis, kategori_portofolio,
       kategori_bumn, proyeksi_mulai, proyeksi_selesai, deskripsi_singkat,
       output, tingkat_kesiapan_teknologi, sifat, rencana_anggaran_biaya,
       dampak_potensi_dampak, dampak_lain, mitra, keterangan]
    );

    const dashboardId = dashboardResult.rows[0].id;

    // Insert detail data if it exists
    if (detail) {
      const insertDetailQuery = `
        INSERT INTO dashboard_detail (
          dashboard_id, bulan_berjalan, progress, capaian, kendala_mitigasi,
          rencana_tindak_lanjut, komersialisasi_produk, monetisasi,
          realisasi_anggaran_biaya, no_triwulan
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      `;

      await client.query(insertDetailQuery, [
        dashboardId, detail.bulan_berjalan, detail.progress, detail.capaian, detail.kendala_mitigasi,
        detail.rencana_tindak_lanjut, detail.komersialisasi_produk, detail.monetisasi,
        detail.realisasi_anggaran_biaya, detail.no_triwulan
      ]);
    }

    await client.query('COMMIT');

    res.status(201).json({ 
      message: 'Dashboard created successfully',
      dashboardId: dashboardId
    });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error in POST /api/dashboard:', err);
    res.status(500).json({ error: 'Internal server error', details: err.message });
  } finally {
    client.release();
  }
});

// PUT endpoint
app.put('/api/dashboard/:id', async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const { id } = req.params;
    const {
      email_address, entitas_perusahaan, divisi, jumlah_kegiatan_riset,
      aspirasi_tema, aspirasi_tema_lain, sektor_bisnis, kategori_portofolio,
      kategori_bumn, proyeksi_mulai, proyeksi_selesai, deskripsi_singkat,
      output, tingkat_kesiapan_teknologi, sifat, rencana_anggaran_biaya,
      dampak_potensi_dampak, dampak_lain, mitra, keterangan, detail
    } = req.body;

    // Update dashboard
    await client.query(
      `UPDATE dashboard SET
        email_address = $1, entitas_perusahaan = $2, divisi = $3, jumlah_kegiatan_riset = $4,
        aspirasi_tema = $5, aspirasi_tema_lain = $6, sektor_bisnis = $7, kategori_portofolio = $8,
        kategori_bumn = $9, proyeksi_mulai = $10, proyeksi_selesai = $11, deskripsi_singkat = $12,
        output = $13, tingkat_kesiapan_teknologi = $14, sifat = $15, rencana_anggaran_biaya = $16,
        dampak_potensi_dampak = $17, dampak_lain = $18, mitra = $19, keterangan = $20
      WHERE id = $21`,
      [email_address, entitas_perusahaan, divisi, jumlah_kegiatan_riset,
       aspirasi_tema, aspirasi_tema_lain, sektor_bisnis, kategori_portofolio,
       kategori_bumn, proyeksi_mulai, proyeksi_selesai, deskripsi_singkat,
       output, tingkat_kesiapan_teknologi, sifat, rencana_anggaran_biaya,
       dampak_potensi_dampak, dampak_lain, mitra, keterangan, id]
    );

    // Update or insert detail
    if (detail) {
      const detailResult = await client.query(
        'SELECT * FROM dashboard_detail WHERE dashboard_id = $1 AND no_triwulan = $2',
        [id, detail.no_triwulan]
      );

      if (detailResult.rows.length > 0) {
        // Update existing detail
        await client.query(
          `UPDATE dashboard_detail SET
            bulan_berjalan = $1, progress = $2, capaian = $3, kendala_mitigasi = $4,
            rencana_tindak_lanjut = $5, komersialisasi_produk = $6, monetisasi = $7,
            realisasi_anggaran_biaya = $8
          WHERE dashboard_id = $9 AND no_triwulan = $10`,
          [detail.bulan_berjalan, detail.progress, detail.capaian, detail.kendala_mitigasi,
           detail.rencana_tindak_lanjut, detail.komersialisasi_produk, detail.monetisasi,
           detail.realisasi_anggaran_biaya, id, detail.no_triwulan]
        );
      } else {
        // Insert new detail
        await client.query(
          `INSERT INTO dashboard_detail (
            dashboard_id, bulan_berjalan, progress, capaian, kendala_mitigasi,
            rencana_tindak_lanjut, komersialisasi_produk, monetisasi,
            realisasi_anggaran_biaya, no_triwulan
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
          [id, detail.bulan_berjalan, detail.progress, detail.capaian,
           detail.kendala_mitigasi, detail.rencana_tindak_lanjut, detail.komersialisasi_produk,
           detail.monetisasi, detail.realisasi_anggaran_biaya, detail.no_triwulan]
        );
      }
    }

    await client.query('COMMIT');

    res.json({ message: 'Dashboard updated successfully' });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error in PUT /api/dashboard/:id:', err);
    res.status(500).json({ error: 'Internal server error', details: err.message });
  } finally {
    client.release();
  }
});

// DELETE endpoint
app.delete('/api/dashboard/:id', async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const { id } = req.params;
    
    // Delete associated detail records first
    await client.query('DELETE FROM dashboard_detail WHERE dashboard_id = $1', [id]);
    
    // Then delete the dashboard record
    const result = await client.query('DELETE FROM dashboard WHERE id = $1', [id]);
    
    await client.query('COMMIT');

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Dashboard not found' });
    }
    
    res.json({ message: 'Dashboard deleted successfully' });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error in DELETE /api/dashboard/:id:', err);
    res.status(500).json({ error: 'Internal server error', details: err.message });
  } finally {
    client.release();
  }
});

app.post('/api/riset-pengembangan', async (req, res) => {
  const {
    timestamp,
    email_address,
    entitas,
    kegiatan_riset_pengembangan,
    aspirasi_tema,
    sektor_bisnis,
    proyeksi_jangka_waktu_mulai,
    proyeksi_jangka_waktu_selesai,
    bulan_berjalan,
    progress,
    deskripsi_singkat,
    capaian_highlighted_achievements,
    kendala_mitigasi,
    rencana_tindak_lanjut,
    tingkat_kesiapan_teknologi,
    komersialisasi_produk,
    sifat,
    realisasi_anggaran_biaya,
    dampak_potensi_dampak,
    divisi,
    portofolio_subportofolio_idsurvey,
    mitra,
    keterangan,
    dampak_lain,
    aspirasi_tema_lain,
    score
  } = req.body;

  const { data: lastIdData, error: lastIdError } = await supabase
      .from('riset_pengembangan')
      .select('id')
      .order('id', { ascending: false })
      .limit(1);

    if (lastIdError) throw lastIdError;

    const lastId = lastIdData[0]?.id || 0;
    const newId = lastId + 1;

  try {
    const result = await pool.query(
      `INSERT INTO riset_pengembangan (
        timestamp, email_address, entitas, kegiatan_riset_pengembangan, 
        aspirasi_tema, sektor_bisnis, proyeksi_jangka_waktu_mulai, 
        proyeksi_jangka_waktu_selesai, bulan_berjalan, progress, 
        deskripsi_singkat, capaian_highlighted_achievements, 
        kendala_mitigasi, rencana_tindak_lanjut, 
        tingkat_kesiapan_teknologi, komersialisasi_produk, sifat, 
        realisasi_anggaran_biaya, dampak_potensi_dampak, divisi, 
        portofolio_subportofolio_idsurvey, mitra, keterangan, 
        dampak_lain, aspirasi_tema_lain, score
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, 
        $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26) RETURNING *`,
      [
        timestamp,
        email_address,
        entitas,
        kegiatan_riset_pengembangan,
        aspirasi_tema,
        sektor_bisnis,
        proyeksi_jangka_waktu_mulai,
        proyeksi_jangka_waktu_selesai,
        bulan_berjalan,
        progress,
        deskripsi_singkat,
        capaian_highlighted_achievements,
        kendala_mitigasi,
        rencana_tindak_lanjut,
        tingkat_kesiapan_teknologi,
        komersialisasi_produk,
        sifat,
        realisasi_anggaran_biaya,
        dampak_potensi_dampak,
        divisi,
        portofolio_subportofolio_idsurvey,
        mitra,
        keterangan,
        dampak_lain,
        aspirasi_tema_lain,
        score
      ]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.delete('/api/riset-pengembangan/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query('DELETE FROM riset_pengembangan WHERE id = $1 RETURNING *', [id]);

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Data ID not found' });
    }

    res.json({ message: 'Data has deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete data' });
  }
});

app.put('/api/riset-pengembangan/:id', async (req, res) => {
  const { id } = req.params;
  const {
    timestamp,
    email_address,
    entitas,
    kegiatan_riset_pengembangan,
    aspirasi_tema,
    sektor_bisnis,
    proyeksi_jangka_waktu_mulai,
    proyeksi_jangka_waktu_selesai,
    bulan_berjalan,
    progress,
    deskripsi_singkat,
    capaian_highlighted_achievements,
    kendala_mitigasi,
    rencana_tindak_lanjut,
    tingkat_kesiapan_teknologi,
    komersialisasi_produk,
    sifat,
    realisasi_anggaran_biaya,
    dampak_potensi_dampak,
    divisi,
    portofolio_subportofolio_idsurvey,
    mitra,
    keterangan,
    dampak_lain,
    aspirasi_tema_lain,
    score
  } = req.body;

  try {
    const result = await pool.query(
      `UPDATE riset_pengembangan SET
        timestamp = $1, email_address = $2, entitas = $3, kegiatan_riset_pengembangan = $4,
        aspirasi_tema = $5, sektor_bisnis = $6, proyeksi_jangka_waktu_mulai = $7,
        proyeksi_jangka_waktu_selesai = $8, bulan_berjalan = $9, progress = $10, deskripsi_singkat = $11,
        capaian_highlighted_achievements = $12, kendala_mitigasi = $13, rencana_tindak_lanjut = $14,
        tingkat_kesiapan_teknologi = $15, komersialisasi_produk = $16, sifat = $17, realisasi_anggaran_biaya = $18,
        dampak_potensi_dampak = $19, divisi = $20, portofolio_subportofolio_idsurvey = $21, mitra = $22, keterangan = $23,
        dampak_lain = $24, aspirasi_tema_lain = $25, score = $26
      WHERE id = $27 RETURNING *`,
      [
        timestamp,
        email_address,
        entitas,
        kegiatan_riset_pengembangan,
        aspirasi_tema,
        sektor_bisnis,
        proyeksi_jangka_waktu_mulai,
        proyeksi_jangka_waktu_selesai,
        bulan_berjalan,
        progress,
        deskripsi_singkat,
        capaian_highlighted_achievements,
        kendala_mitigasi,
        rencana_tindak_lanjut,
        tingkat_kesiapan_teknologi,
        komersialisasi_produk,
        sifat,
        realisasi_anggaran_biaya,
        dampak_potensi_dampak,
        divisi,
        portofolio_subportofolio_idsurvey,
        mitra,
        keterangan,
        dampak_lain,
        aspirasi_tema_lain,
        score,
        id
      ]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Data riset pengembangan not found' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update data' });
  }
});

const port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});