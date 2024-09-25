import { useCallback, useEffect, useState } from 'react';
import { DataGrid, GridColDef} from '@mui/x-data-grid';
import { Box, Button, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle, MenuItem, Select, Tabs, Tab, TextField, Typography, SelectChangeEvent } from '@mui/material';
import axios from 'axios';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';

interface Dashboard {
  id?: number;
  email_address: string;
  entitas_perusahaan: string;
  divisi: string;
  jumlah_kegiatan_riset: number;
  aspirasi_tema: string;
  aspirasi_tema_lain: string;
  sektor_bisnis: string;
  kategori_portofolio: string;
  kategori_bumn: string;
  proyeksi_mulai: string;
  proyeksi_selesai: string;
  deskripsi_singkat: string;
  output: string;
  tingkat_kesiapan_teknologi: string;
  sifat: string;
  rencana_anggaran_biaya: number;
  dampak_potensi_dampak: string;
  dampak_lain: string;
  mitra: string;
  keterangan: string;
  detail?: DashboardDetail[];
}

interface DashboardDetail {
  id?: number;
  dashboard_id: number;
  bulan_berjalan: string;
  progress: string;
  capaian: string;
  kendala_mitigasi: string;
  rencana_tindak_lanjut: string;
  komersialisasi_produk: string;
  monetisasi: string;
  realisasi_anggaran_biaya: string;
  no_triwulan: number;
}

const validationSchema = Yup.object().shape({
  dashboard: Yup.object().shape({
    email_address: Yup.string().email('Format email tidak valid').required('Email wajib diisi'),
    entitas_perusahaan: Yup.string().required('Entitas perusahaan wajib diisi'),
    divisi: Yup.string().required('Divisi wajib diisi'),
    jumlah_kegiatan_riset: Yup.number().required('Jumlah kegiatan riset wajib diisi'),
    aspirasi_tema: Yup.string().required('Aspirasi tema wajib diisi'),
    aspirasi_tema_lain: Yup.string(),
    sektor_bisnis: Yup.string().required('Sektor bisnis wajib diisi'),
    kategori_portofolio: Yup.string().required('Kategori portofolio wajib diisi'),
    kategori_bumn: Yup.string().required('Kategori BUMN wajib diisi'),
    proyeksi_mulai: Yup.date().required('Proyeksi mulai wajib diisi'),
    proyeksi_selesai: Yup.date().required('Proyeksi selesai wajib diisi'),
    deskripsi_singkat: Yup.string().required('Deskripsi singkat wajib diisi'),
    output: Yup.string().required('Output wajib diisi'),
    tingkat_kesiapan_teknologi: Yup.string().required('Tingkat kesiapan teknologi wajib diisi'),
    sifat: Yup.string().required('Sifat wajib diisi'),
    rencana_anggaran_biaya: Yup.number().required('Rencana anggaran biaya wajib diisi'),
    dampak_potensi_dampak: Yup.string().required('Dampak/potensi dampak wajib diisi'),
    dampak_lain: Yup.string(),
    mitra: Yup.string().required('Mitra wajib diisi'),
    keterangan: Yup.string(),
  }),
  detail: Yup.object().shape({
    bulan_berjalan: Yup.string().required('Bulan berjalan wajib diisi'),
    progress: Yup.string().required('Progress wajib diisi'),
    capaian: Yup.string().required('Capaian wajib diisi'),
    kendala_mitigasi: Yup.string().required('Kendala/mitigasi wajib diisi'),
    rencana_tindak_lanjut: Yup.string().required('Rencana tindak lanjut wajib diisi'),
    komersialisasi_produk: Yup.string().required('Komersialisasi produk wajib diisi'),
    monetisasi: Yup.string().required('Monetisasi wajib diisi'),
    realisasi_anggaran_biaya: Yup.string().required('Realisasi anggaran biaya wajib diisi'),
  }),
});

export default function DashboardTable() {
  const [data, setData] = useState<Dashboard[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogMode, setDialogMode] = useState<'add' | 'edit'>('add');
  const [currentItem, setCurrentItem] = useState<{dashboard: Partial<Dashboard>, detail: Partial<DashboardDetail>}>({
    dashboard: {},
    detail: {}
  });
  const [selectedQuarter, setSelectedQuarter] = useState<number>(1);
  const [tabValue, setTabValue] = useState(0);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const columns: GridColDef[] = [
    { field: 'id', headerName: 'Dashboard ID', width: 120 },
    { field: 'email_address', headerName: 'Email', width: 200 },
    { field: 'entitas_perusahaan', headerName: 'Entitas Perusahaan', width: 200 },
    { field: 'divisi', headerName: 'Divisi', width: 150 },
    { field: 'jumlah_kegiatan_riset', headerName: 'Jumlah Kegiatan Riset', width: 180, type: 'number' },
    { field: 'aspirasi_tema', headerName: 'Aspirasi Tema', width: 180 },
    { field: 'sektor_bisnis', headerName: 'Sektor Bisnis', width: 150 },
    { field: 'kategori_portofolio', headerName: 'Kategori Portofolio', width: 180 },
    { field: 'bulan_berjalan', headerName: 'Bulan Berjalan', width: 150 },
    { field: 'progress', headerName: 'Progress', width: 150 },
    { field: 'capaian', headerName: 'Capaian', width: 150 },
    { field: 'kendala_mitigasi', headerName: 'Kendala/Mitigasi', width: 200 },
    { field: 'rencana_tindak_lanjut', headerName: 'Rencana Tindak Lanjut', width: 200 },
    {
      field: 'actions',
      headerName: 'Aksi',
      width: 200,
      renderCell: (params) => (
        <Box>
          <Button onClick={() => handleEdit(params.row.id)}>Edit</Button>
          <Button onClick={() => handleDelete(params.row.id)} color="error">Hapus</Button>
        </Box>
      ),
    },
  ];

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get<Dashboard[]>('http://localhost:5000/api/dashboard');
      const combinedData = response.data.map(dashboard => {
        const detail = dashboard.detail?.find(d => d.no_triwulan === selectedQuarter) || {};
        return { ...dashboard, ...detail, id: dashboard.id };
      });
      setData(combinedData);
    } catch (error) {
      console.error('Error fetching data:', error);
      setError('Failed to fetch data.');
    } finally {
      setLoading(false);
    }
  }, [selectedQuarter]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleAdd = () => {
    setDialogMode('add');
    setCurrentItem({ dashboard: {}, detail: { no_triwulan: selectedQuarter } });
    setOpenDialog(true);
  };

  const handleEdit = (id: number) => {
    setDialogMode('edit');
    const item = data.find(item => item.id === id);
    if (item) {
      const { detail, ...dashboardData } = item;
      setCurrentItem({
        dashboard: dashboardData,
        detail: detail?.find(d => d.no_triwulan === selectedQuarter) || { no_triwulan: selectedQuarter }
      });
    }
    setOpenDialog(true);
  };

  const handleSave = async (values: {dashboard: Partial<Dashboard>, detail: Partial<DashboardDetail>}) => {
    try {
      if (dialogMode === 'add') {
        await axios.post('http://localhost:5000/api/dashboard', {
          ...values.dashboard,
          detail: { ...values.detail, no_triwulan: selectedQuarter }
        });
      } else {
        await axios.put(`http://localhost:5000/api/dashboard/${values.dashboard.id}`, { ...values.dashboard,
          detail: { ...values.detail, no_triwulan: selectedQuarter }
        });
      }
      setOpenDialog(false);
      fetchData();
    } catch (error) {
      console.error('Error saving item:', error);
      if (axios.isAxiosError(error) && error.response) {
        alert(`Failed to save item. Server error: ${error.response.data.error}`);
      } else {
        alert('Failed to save item. Please try again.');
      }
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      try {
        await axios.delete(`http://localhost:5000/api/dashboard/${id}`);
        fetchData();
        alert('Item deleted successfully');
      } catch (error) {
        console.error('Error deleting item:', error);
        alert('Failed to delete item. Please try again.');
      }
    }
  };  

  const handleQuarterChange = (event: SelectChangeEvent<number>) => {
    setSelectedQuarter(event.target.value as number);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="600px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="600px">
        <Typography variant="h6" color="error">
          {error}
        </Typography>
      </Box>
    );
  }

  return (
    <div style={{ height: 600, width: '100%', backgroundColor: '#fff' }}>
      <Box mb={2}>
        <Typography variant="h4" mr={2}>Select Triwulan (Quarter)</Typography>
      </Box>
      <Box mb={2} display="flex" justifyContent='space-between' alignItems="center">
        <Button onClick={handleAdd} variant="contained" color="primary" sx={{ ml: 2 }}>
          Add
        </Button>
        <Select
          value={selectedQuarter}
          onChange={handleQuarterChange}
          inputProps={{'aria-label': 'Without label'}}
          displayEmpty
        >
          <MenuItem value={1}>Q1</MenuItem>
          <MenuItem value={2}>Q2</MenuItem>
          <MenuItem value={3}>Q3</MenuItem>
          <MenuItem value={4}>Q4</MenuItem>
        </Select>
      </Box>
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
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>{dialogMode === 'add' ? 'Add New Item' : 'Edit Item'}</DialogTitle>
        <Formik
          initialValues={currentItem}
          validationSchema={validationSchema}
          onSubmit={handleSave}
          enableReinitialize
        >
          {({ errors, touched, setFieldValue }) => (
            <Form>
              <DialogContent>
                <Tabs value={tabValue} onChange={handleTabChange}>
                  <Tab label="Informasi Umum" />
                  <Tab label="Detail Triwulan" />
                </Tabs>
                {tabValue === 0 && (
                  <Box>
                    <Field
                      as={TextField}
                      name="dashboard.email_address"
                      label="Email"
                      fullWidth
                      margin="dense"
                      error={touched.dashboard?.email_address && Boolean(errors.dashboard?.email_address)}
                      helperText={touched.dashboard?.email_address && errors.dashboard?.email_address}
                    />
                    <Field
                      as={TextField}
                      name="dashboard.entitas_perusahaan"
                      label="Entitas Perusahaan"
                      fullWidth
                      margin="dense"
                      error={touched.dashboard?.entitas_perusahaan && Boolean(errors.dashboard?.entitas_perusahaan)}
                      helperText={touched.dashboard?.entitas_perusahaan && errors.dashboard?.entitas_perusahaan}
                    />
                    <Field
                      as={TextField}
                      name="dashboard.divisi"
                      label="Divisi"
                      fullWidth
                      margin="dense"
                      error={touched.dashboard?.divisi && Boolean(errors.dashboard?.divisi)}
                      helperText={touched.dashboard?.divisi && errors.dashboard?.divisi}
                    />
                    <Field
                      as={TextField}
                      name="dashboard.jumlah_kegiatan_riset"
                      label="Jumlah Kegiatan Riset"
                      type="number"
                      fullWidth
                     margin="dense"
                      error={touched.dashboard?.jumlah_kegiatan_riset && Boolean(errors.dashboard?.jumlah_kegiatan_riset)}
                      helperText={touched.dashboard?.jumlah_kegiatan_riset && errors.dashboard?.jumlah_kegiatan_riset}
                    />
                    <Field
                      as={TextField}
                      name="dashboard.aspirasi_tema"
                      label="Aspirasi Tema"
                      fullWidth
                      margin="dense"
                      error={touched.dashboard?.aspirasi_tema && Boolean(errors.dashboard?.aspirasi_tema)}
                      helperText={touched.dashboard?.aspirasi_tema && errors.dashboard?.aspirasi_tema}
                    />
                    <Field
                      as={TextField}
                      name="dashboard.aspirasi_tema_lain"
                      label="Aspirasi Tema Lain"
                      fullWidth
                      margin="dense"
                      />
                    <Field
                      as={TextField}
                      name="dashboard.sektor_bisnis"
                      label="Sektor Bisnis"
                      fullWidth
                      margin="dense"
                      error={touched.dashboard?.sektor_bisnis && Boolean(errors.dashboard?.sektor_bisnis)}
                      helperText={touched.dashboard?.sektor_bisnis && errors.dashboard?.sektor_bisnis}
                    />
                    <Field
                      as={TextField}
                      name="dashboard.kategori_portofolio"
                      label="Kategori Portofolio"
                      fullWidth
                     margin="dense"
                      error={touched.dashboard?.kategori_portofolio && Boolean(errors.dashboard?.kategori_portofolio)}
                      helperText={touched.dashboard?.kategori_portofolio && errors.dashboard?.kategori_portofolio}
                    />
                    <Field
                      as={TextField}
                      name="dashboard.kategori_bumn"
                      label="Kategori BUMN"
                      fullWidth
                      margin="dense"
                      error={touched.dashboard?.kategori_bumn && Boolean(errors.dashboard?.kategori_bumn)}
                      helperText={touched.dashboard?.kategori_bumn && errors.dashboard?.kategori_bumn}
                    />
                    <Field
                      as={TextField}
                      name="dashboard.proyeksi_mulai"
                      label="Proyeksi Mulai"
                      type="date"
                      fullWidth
                      margin="dense"
                      InputLabelProps={{ shrink: true }}
                      error={touched.dashboard?.proyeksi_mulai && Boolean(errors.dashboard?.proyeksi_mulai)}
                      helperText={touched.dashboard?.proyeksi_mulai && errors.dashboard?.proyeksi_mulai}
                    />
                    <Field
                      as={TextField}
                      name="dashboard.proyeksi_selesai"
                      label="Proyeksi Selesai"
                      type="date"
                      fullWidth
                      margin="dense"
                      InputLabelProps={{ shrink: true }}
                      error={touched.dashboard?.proyeksi_selesai && Boolean(errors.dashboard?.proyeksi_selesai)}
                      helperText={touched.dashboard?.proyeksi_selesai && errors.dashboard?.proyeksi_selesai}
                    />
                    <Field
                      as={TextField}
                      name="dashboard.deskripsi_singkat"
                      label="Deskripsi Singkat"
                      fullWidth
                      multiline
                      rows={4}
                      margin="dense"
                      error={touched.dashboard?.deskripsi_singkat && Boolean(errors.dashboard?.deskripsi_singkat)}
                      helperText={touched.dashboard?.deskripsi_singkat && errors.dashboard?.deskripsi_singkat}
                    />
                    <Field
                      as={TextField}
                      name="dashboard.output"
                      label="Output"
                      fullWidth
                      margin="dense"
                      error={touched.dashboard?.output && Boolean(errors.dashboard?.output)}
                      helperText={touched.dashboard?.output && errors.dashboard?.output}
                    />
                    <Field
                      as={TextField}
                      name="dashboard.tingkat_kesiapan_teknologi"
                      label="Tingkat Kesiapan Teknologi"
                      fullWidth
                      margin="dense"
                      error={touched.dashboard?.tingkat_kesiapan_teknologi && Boolean(errors.dashboard?.tingkat_kesiapan_teknologi)}
                      helperText={touched.dashboard?.tingkat_kesiapan_teknologi && errors.dashboard?.tingkat_kesiapan_teknologi}
                    />
                    <Field
                      as={TextField}
                      name="dashboard.sifat"
                      label="Sifat"
                      fullWidth
                      margin="dense"
                      error={touched.dashboard?.sifat && Boolean(errors.dashboard?.sifat)}
                      helperText={touched.dashboard?.sifat && errors.dashboard?.sifat}
                    />
                    <Field
                      as={TextField}
                      name="dashboard.rencana_anggaran_biaya"
                      label="Rencana Anggaran Biaya"
                      type="number"
                      fullWidth
                      margin="dense"
                      error={touched.dashboard?.rencana_anggaran_biaya && Boolean(errors.dashboard?.rencana_anggaran_biaya)}
                      helperText={touched.dashboard?.rencana_anggaran_biaya && errors.dashboard?.rencana_anggaran_biaya}
                    />
                    <Field
                      as={TextField}
                      name="dashboard.dampak_potensi_dampak"
                      label="Dampak/Potensi Dampak"
                      fullWidth
                      multiline
                      rows={4}
                     margin="dense"
                      error={touched.dashboard?.dampak_potensi_dampak && Boolean(errors.dashboard?.dampak_potensi_dampak)}
                      helperText={touched.dashboard?.dampak_potensi_dampak && errors.dashboard?.dampak_potensi_dampak}
                    />
                    <Field
                      as={TextField}
                      name="dashboard.dampak_lain"
                      label="Dampak Lain"
                      fullWidth
                      margin="dense"
                    />
                    <Field
                      as={TextField}
                      name="dashboard.mitra"
                      label="Mitra"
                      fullWidth
                      margin="dense"
                      error={touched.dashboard?.mitra && Boolean(errors.dashboard?.mitra)}
                      helperText={touched.dashboard?.mitra && errors.dashboard?.mitra}
                    />
                    <Field
                      as={TextField}
                      name="dashboard.keterangan"
                      label="Keterangan"
                      fullWidth
                      multiline
                      rows={4}
                      margin="dense"
                    />
                  </Box>
                )}
                {tabValue === 1 && (
                  <Box>
                    <Field
                      as={Select}
                      name="selectedQuarter"
                      label="Pilih Triwulan"
                      fullWidth
                      margin="dense"
                      value={selectedQuarter}
                      onChange={(e: any) => {
                        setSelectedQuarter(e.target.value as number);
                        setFieldValue('detail.no_triwulan', e.target.value);
                      }}
                    >
                      <MenuItem value={1}>Triwulan 1</MenuItem>
                      <MenuItem value={2}>Triwulan 2</MenuItem>
                      <MenuItem value={3}>Triwulan 3</MenuItem>
                      <MenuItem value={4}>Triwulan 4</MenuItem>
                    </Field>
                    
                    <Typography variant="h6">Triwulan {selectedQuarter}</Typography>
                    <Field
                      as={TextField}
                      name="detail.bulan_berjalan"
                      label="Bulan Berjalan"
                      fullWidth
                      margin="dense"
                      error={touched.detail?.bulan_berjalan && Boolean(errors.detail?.bulan_berjalan)}
                      helperText={touched.detail?.bulan_berjalan && errors.detail?.bulan_berjalan}
                    />
                    <Field
                      as={TextField}
                      name="detail.progress"
                      label="Progress"
                      fullWidth
                      margin="dense"
                      error={touched.detail?.progress && Boolean(errors.detail?.progress)}
                      helperText={touched.detail?.progress && errors.detail?.progress}
                    />
                    <Field
                      as={TextField}
                      name="detail.capaian"
                      label="Capaian"
                      fullWidth
                      margin="dense"
                      error={touched.detail?.capaian && Boolean(errors.detail?.capaian)}
                      helperText={touched.detail?.capaian && errors.detail?.capaian}
                    />
                    <Field
                      as={TextField}
                      name="detail.kendala_mitigasi"
                      label="Kendala/Mitigasi"
                      fullWidth
                      margin="dense"
                      error={touched.detail?.kendala_mitigasi && Boolean(errors.detail?.kendala_mitigasi)}
                      helperText={touched.detail?.kendala_mitigasi && errors.detail?.kendala_mitigasi}
                    />
                    <Field
                      as={TextField}
                      name="detail.rencana_tindak_lanjut"
                      label="Rencana Tindak Lanjut"
                      fullWidth
                      margin="dense"
                      error={touched.detail?.rencana_tindak_lanjut && Boolean(errors.detail?.rencana_tindak_lanjut)}
                      helperText={touched.detail?.rencana_tindak_lanjut && errors.detail?.rencana_tindak_lanjut}
                    />
                    <Field
                      as={TextField}
                      name="detail.komersialisasi_produk"
                      label="Komersialisasi Produk"
                      fullWidth
                      margin="dense"
                      error={touched.detail?.komersialisasi_produk && Boolean(errors.detail?.komersialisasi_produk)}
                      helperText={touched.detail?.komersialisasi_produk && errors.detail?.komersialisasi_produk}
                    />
                    <Field
                      as={TextField}
                      name="detail.monetisasi"
                      label="Monetisasi"
                      fullWidth
                      margin="dense"
                      error={touched.detail?.monetisasi && Boolean(errors.detail?.monetisasi)}
                      helperText={touched.detail?.monetisasi && errors.detail?.monetisasi}
                    />
                    <Field
                      as={TextField}
                      name="detail.realisasi_anggaran_biaya"
                      label="Realisasi Anggaran Biaya"
                      fullWidth
                      margin="dense"
                      error={touched.detail?.realisasi_anggaran_biaya && Boolean(errors.detail?.realisasi_anggaran_biaya)}
                      helperText={touched.detail?.realisasi_anggaran_biaya && errors.detail?.realisasi_anggaran_biaya}
                    />
                  </Box>
                )}
              </DialogContent>
              <DialogActions>
                <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
                <Button type="submit">Save</Button>
              </DialogActions>
            </Form>
          )}
        </Formik>
      </Dialog>
    </div>
  );
}