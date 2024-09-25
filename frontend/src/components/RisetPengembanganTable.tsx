import axios from 'axios';
import * as Yup from 'yup';
import dayjs from 'dayjs';
import { useEffect, useState } from 'react';
import { Formik, Form, Field, FieldProps } from 'formik';
import { Box, Container, Typography, Button, Dialog, TextField, Snackbar, Alert } from '@mui/material';
import { DataGrid, GridColDef, GridRowId } from '@mui/x-data-grid';
import { DateTimePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';

interface RisetPengembangan {
  id: number;
  timestamp: string;
  email_address: string;
  entitas: string;
  kegiatan_riset_pengembangan: number;
  aspirasi_tema: string;
  sektor_bisnis: string;
  proyeksi_jangka_waktu_mulai: string;
  proyeksi_jangka_waktu_selesai: string;
  bulan_berjalan: string;
  progress: string;
  deskripsi_singkat: string;
  capaian_highlighted_achievements: string;
  kendala_mitigasi: string;
  rencana_tindak_lanjut: string;
  tingkat_kesiapan_teknologi: string;
  komersialisasi_produk: string;
  sifat: string;
  realisasi_anggaran_biaya: string;
  dampak_potensi_dampak: string;
  divisi: string;
  portofolio_subportofolio_idsurvey: string;
  mitra: string;
  keterangan: string;
  dampak_lain: string;
  aspirasi_tema_lain: string;
  score: number;
}

const validationSchema = Yup.object().shape({
  timestamp: Yup.string().required('Timestamp is required'),
  email_address: Yup.string().email('Email invalid').required('Email wajib diisi'),
  entitas: Yup.string().required('Entitas wajib diisi'),
  kegiatan_riset_pengembangan: Yup.number().required('Required').positive('Must be positive number'),
  score: Yup.number().required('Required').positive('Must be positive number'),
})


export default function RisetPengembanganTable() {
  const [data, setData] = useState<RisetPengembangan[]>([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error'>('success');
  const [dialogMode, setDialogMode] = useState<'add' | 'edit'>('add');

  const [currentItem, setCurrentItem] = useState<RisetPengembangan>({
    id: 0,
    timestamp: '',
    email_address: '',
    entitas: '',
    kegiatan_riset_pengembangan: 0,
    aspirasi_tema: '',
    sektor_bisnis: '',
    proyeksi_jangka_waktu_mulai: '',
    proyeksi_jangka_waktu_selesai: '',
    bulan_berjalan: '',
    progress: '',
    deskripsi_singkat: '',
    capaian_highlighted_achievements: '',
    kendala_mitigasi: '',
    rencana_tindak_lanjut: '',
    tingkat_kesiapan_teknologi: '',
    komersialisasi_produk: '',
    sifat: '',
    realisasi_anggaran_biaya: '',
    dampak_potensi_dampak: '',
    divisi: '',
    portofolio_subportofolio_idsurvey: '',
    mitra: '',
    keterangan: '',
    dampak_lain: '',
    aspirasi_tema_lain: '',
    score: 0,
  });

  const fetchData = async () => {
  try {
    const response = await axios.get('http://localhost:5000/api/riset-pengembangan');
    const fetchedData = response.data;

    const cleanedData = fetchedData.map((item: any) => {
      const cleanedItem = { ...item };
      Object.keys(cleanedItem).forEach((key) => {
        if (cleanedItem[key] === null) {
          cleanedItem[key] = '-';
        }
      });
      return cleanedItem;
    });

    setData(cleanedData);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCloseSnackbar = () => {
    setOpenSnackbar(false);
  };

  const handleAdd = () => {
    setDialogMode('add');
    setCurrentItem({
      id: 0,
      timestamp: '',
      email_address: '',
      entitas: '',
      kegiatan_riset_pengembangan: 0,
      aspirasi_tema: '',
      sektor_bisnis: '',
      proyeksi_jangka_waktu_mulai: '',
      proyeksi_jangka_waktu_selesai: '',
      bulan_berjalan: '',
      progress: '',
      deskripsi_singkat: '',
      capaian_highlighted_achievements: '',
      kendala_mitigasi: '',
      rencana_tindak_lanjut: '',
      tingkat_kesiapan_teknologi: '',
      komersialisasi_produk: '',
      sifat: '',
      realisasi_anggaran_biaya: '',
      dampak_potensi_dampak: '',
      divisi: '',
      portofolio_subportofolio_idsurvey: '',
      mitra: '',
      keterangan: '',
      dampak_lain: '',
      aspirasi_tema_lain: '',
      score: 0,
    });
    setOpenDialog(true);
  }

  const handleSave = async (values: RisetPengembangan) => {
    try {
      if (dialogMode === 'add'){
        await axios.post('http://localhost:5000/api/riset-pengembangan', values);
        setSnackbarMessage('Registration successful!');
      } else if (dialogMode === 'edit' && values.id ) {
        await axios.put(`http://localhost:5000/api/riset-pengembangan/${values.id}`, values);
        setSnackbarMessage('Data has been edited!');
      }
      setSnackbarSeverity('success');
      setOpenSnackbar(true);
      setOpenDialog(false);
      fetchData();
    } catch (error) {
      console.error('Error saving data:', error);
      setSnackbarMessage('Error saving data');
      setSnackbarSeverity('error');
      setOpenSnackbar(true);
    }
  };

  const handleEdit = (id: GridRowId) => {
    setDialogMode('edit');
    const item = data.find(item => item.id === id);
    setCurrentItem(item || {
      id: 0,
      timestamp: '',
      email_address: '',
      entitas: '',
      kegiatan_riset_pengembangan: 0,
      aspirasi_tema: '',
      sektor_bisnis: '',
      proyeksi_jangka_waktu_mulai: '',
      proyeksi_jangka_waktu_selesai: '',
      bulan_berjalan: '',
      progress: '',
      deskripsi_singkat: '',
      capaian_highlighted_achievements: '',
      kendala_mitigasi: '',
      rencana_tindak_lanjut: '',
      tingkat_kesiapan_teknologi: '',
      komersialisasi_produk: '',
      sifat: '',
      realisasi_anggaran_biaya: '',
      dampak_potensi_dampak: '',
      divisi: '',
      portofolio_subportofolio_idsurvey: '',
      mitra: '',
      keterangan: '',
      dampak_lain: '',
      aspirasi_tema_lain: '',
      score: 0,
    });
    setOpenDialog(true);
  };

  const handleDelete = async (id: GridRowId) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      try {
        await axios.delete(`http://localhost:5000/api/riset-pengembangan/${id}`);
        setSnackbarMessage('Delete data successful!');
        setSnackbarSeverity('success');
        setOpenSnackbar(true);
        fetchData();
      } catch (error) {
        console.error('Error deleting item:', error);
        setSnackbarMessage('Registration successful!');
        setSnackbarSeverity('error');
        setOpenSnackbar(true)
      }
    }
  };

  const columns: GridColDef[] = [
    { field: 'id', headerName: 'ID', width: 70 },
    { field: 'timestamp', headerName: 'Timestamp', width: 200 },
    { field: 'email_address', headerName: 'Email', width: 200 },
    { field: 'entitas', headerName: 'Entitas', width: 200 },
    { field: 'kegiatan_riset_pengembangan', headerName: 'Kegiatan R&D', width: 150, type: 'number' },
    { field: 'aspirasi_tema', headerName: 'Aspirasi/Tema', width: 300 },
    { field: 'sektor_bisnis', headerName: 'Sektor Bisnis', width: 200 },
    { field: 'proyeksi_jangka_waktu_mulai', headerName: 'Mulai', width: 120 },
    { field: 'proyeksi_jangka_waktu_selesai', headerName: 'Selesai', width: 120 },
    { field: 'bulan_berjalan', headerName: 'Bulan Berjalan', width: 150 },
    { field: 'progress', headerName: 'Progress', width: 150 },
    { field: 'deskripsi_singkat', headerName: 'Deskripsi Singkat', width: 300 },
    { field: 'capaian_highlighted_achievements', headerName: 'Capaian/Highlighted Achievements', width: 300 },
    { field: 'kendala_mitigasi', headerName: 'Kendala/Mitigasi', width: 300 },
    { field: 'rencana_tindak_lanjut', headerName: 'Rencana/Tindak Lanjut', width: 300 },
    { field: 'tingkat_kesiapan_teknologi', headerName: 'Tingkat Kesiapan Teknologi', width: 200 },
    { field: 'komersialisasi_produk', headerName: 'Komersialisasi Produk', width: 200 },
    { field: 'sifat', headerName: 'Sifat', width: 100 },
    { field: 'realisasi_anggaran_biaya', headerName: 'Realisasi/Anggaran Biaya', width: 200 },
    { field: 'dampak_potensi_dampak', headerName: 'Dampak/Potensi Dampak', width: 200 },
    { field: 'divisi', headerName: 'Divisi', width: 150 },
    { field: 'portofolio_subportofolio_idsurvey', headerName: 'Portofolio & SubPortofolio IDSurvey', width: 300 },
    { field: 'mitra', headerName: 'Mitra', width: 150 },
    { field: 'keterangan', headerName: 'Keterangan', width: 200 },
    { field: 'dampak_lain', headerName: 'Dampak Lain', width: 200 },
    { field: 'aspirasi_tema_lain', headerName: 'Aspirasi/Tema Lain', width: 200 },
    { field: 'score', headerName: 'Score', width: 100, type: 'number' },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 200,
      renderCell: (params) => (
        <Box>
          <Button onClick={() => handleEdit(params.row.id)}>Edit</Button>
          <Button onClick={() => handleDelete(params.row.id)} color="error">Delete</Button>
        </Box>
      ),
    },
  ];

  return (
    <Container>
      <Box sx={{mb:2}}>
        <Typography variant="h4" component="h5" >
          Riset Pengembangan
        </Typography>
      </Box>
      <Box sx={{my:2}}>
        <Button variant='contained' onClick={handleAdd}>
          Add new research
        </Button>
        <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth aria-labelledby="add-research-dialog-title" aria-describedby="add-research-dialog-description">
          <Formik
            initialValues={currentItem}
            validationSchema={validationSchema}
            onSubmit={handleSave}
          >
            {({ errors, touched, isSubmitting, setFieldValue }) => (
              <Form>
                <Box display="grid" gridTemplateColumns="repeat(1, 1fr)" gap={2} sx={{px:3, py:2}}>
                  <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <Field
                      name="timestamp"
                      component={({ field }: FieldProps) => (
                        <DateTimePicker
                          label="Timestamp"
                          value={field.value ? dayjs(field.value) : null}
                          onChange={(newValue) => {
                            setFieldValue(field.name, newValue?.format('M/D/YYYY H:mm:ss') || '');
                          }}
                          slots={{ textField: (props) => <TextField {...props} fullWidth /> }}
                        />
                      )}
                    />
                  </LocalizationProvider>
                  <Field
                    as={TextField}
                    name="email_address"
                    label="Email Address"
                    error={touched.email_address && !!errors.email_address}
                    helperText={touched.email_address && errors.email_address}
                    fullWidth
                  />

                  <Field
                    as={TextField}
                    name="entitas"
                    label="Entitas"
                    error={touched.entitas && !!errors.entitas}
                    helperText={touched.entitas && errors.entitas}
                    fullWidth
                  />
                  <Field
                    as={TextField}
                    name="kegiatan_riset_pengembangan"
                    label="Kegiatan Riset/Pengembangan"
                    fullWidth
                    type="number"
                  />
                  <Field
                    as={TextField}
                    name="aspirasi_tema"
                    label="Aspirasi Tema"
                    fullWidth
                  />
                  <Field
                    as={TextField}
                    name="sektor_bisnis"
                    label="Sektor Bisnis"
                    fullWidth
                  />
                  <Field
                    as={TextField}
                    name="proyeksi_jangka_waktu_mulai"
                    label="Proyeksi Jangka Waktu Mulai"
                    fullWidth
                  />
                  <Field
                    as={TextField}
                    name="proyeksi_jangka_waktu_selesai"
                    label="Proyeksi Jangka Waktu Selesai"
                    fullWidth
                  />
                  <Field
                    as={TextField}
                    name="bulan_berjalan"
                    label="Bulan Berjalan"
                    fullWidth
                  />
                  <Field
                    as={TextField}
                    name="progress"
                    label="Progress"
                    fullWidth
                  />
                  <Field
                    as={TextField}
                    name="deskripsi_singkat"
                    label="Deskripsi Singkat"
                    fullWidth
                  />
                  <Field
                    as={TextField}
                    name="capaian_highlighted_achievements"
                    label="Capaian/Highlighted Achievements"
                    fullWidth
                  />
                  <Field
                    as={TextField}
                    name="kendala_mitigasi"
                    label="Kendala/Mitigasi"
                    fullWidth
                  />
                  <Field
                    as={TextField}
                    name="rencana_tindak_lanjut"
                    label="Rencana Tindak Lanjut"
                    fullWidth
                  />
                  <Field
                    as={TextField}
                    name="tingkat_kesiapan_teknologi"
                    label="Tingkat Kesiapan Teknologi"
                    fullWidth
                  />
                  <Field
                    as={TextField}
                    name="komersialisasi_produk"
                    label="Komersialisasi Produk"
                    fullWidth
                  />
                  <Field
                    as={TextField}
                    name="sifat"
                    label="Sifat"
                    fullWidth
                  />
                  <Field
                    as={TextField}
                    name="realisasi_anggaran_biaya"
                    label="Realisasi Anggaran Biaya"
                    fullWidth
                  />
                  <Field
                    as={TextField}
                    name="dampak_potensi_dampak"
                    label="Dampak/Potensi Dampak"
                    fullWidth
                  />
                  <Field
                    as={TextField}
                    name="divisi"
                    label="Divisi"
                    fullWidth
                  />
                  <Field
                    as={TextField}
                    name="portofolio_subportofolio_idsurvey"
                    label="Portofolio/Subportofolio ID Survey"
                    fullWidth
                  />
                  <Field
                    as={TextField}
                    name="mitra"
                    label="Mitra"
                    fullWidth
                  />
                  <Field
                    as={TextField}
                    name="keterangan"
                    label="Keterangan"
                    fullWidth
                  />
                  <Field
                    as={TextField}
                    name="dampak_lain"
                    label="Dampak Lain"
                    fullWidth
                  />
                  <Field
                    as={TextField}
                    name="aspirasi_tema_lain"
                    label="Aspirasi Tema Lain"
                    fullWidth
                  />
                  <Field
                    as={TextField}
                    name="score"
                    label="Score"
                    fullWidth
                    type="number"
                  />        
                </Box>
                <Box sx={{px:3, py:2, display:'flex', flexDirection:'row', gap:2}}>
                  <Button   variant='contained' type="submit" color="primary" disabled={isSubmitting}>{dialogMode === 'add' ? 'Save' : 'Update'}</Button>
                  <Button variant='contained' onClick={() => setOpenDialog(false)} color="secondary">Cancel</Button>
                </Box>
              </Form>
            )}
          </Formik>
        </Dialog>
      </Box>

      <div style={{ height: 600, width: '100%', backgroundColor: '#fff' }}>
      <DataGrid
        rows={data}
        columns={columns}
        sx={{
          bgcolor: '#fff',
          '& .MuiDataGrid-cell': {
            bgcolor: '#fff',
          },
          '& .MuiDataGrid-columnHeaders': {
            bgcolor: '#f5f5f5',
          },
        }}
      />
    </div>
    
      <Snackbar
        open={openSnackbar}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        action={<Button color="inherit" onClick={handleCloseSnackbar}>Close</Button>}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbarSeverity}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Container>
  );
}