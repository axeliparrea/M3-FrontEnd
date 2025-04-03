import React, { useState, useEffect } from "react";
import { 
  Box, 
  Typography, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Paper, 
  IconButton, 
  Button, 
  Dialog, 
  DialogActions, 
  DialogContent, 
  DialogContentText, 
  DialogTitle,
  TextField,
  CircularProgress,
  Snackbar,
  Alert,
  Toolbar
} from "@mui/material";
import { Edit as EditIcon, Delete as DeleteIcon } from "@mui/icons-material";
import { Drawer, List, ListItem, ListItemIcon, ListItemText } from "@mui/material";
import DashboardIcon from "@mui/icons-material/Dashboard";
import ContactMailIcon from "@mui/icons-material/ContactMail";
import ExitToAppIcon from "@mui/icons-material/ExitToApp";
import PeopleIcon from "@mui/icons-material/People";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const drawerWidth = 240;

const Usuarios = () => {
  const navigate = useNavigate();
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [editFormData, setEditFormData] = useState({
    id: "",
    name: "",
    email: "",
    password: ""
  });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success"
  });

  // Función para obtener usuarios de la API
  const fetchUsuarios = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      console.log("Token antes de la petición:", token);
      
      const response = await axios.get("http://localhost:3000/users", {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      console.log("Respuesta exitosa:", response.data);
      setUsuarios(response.data);
      setLoading(false);
    } catch (err) {
      console.error("Error completo:", err);
      console.error("Status:", err.response?.status);
      console.error("Datos del error:", err.response?.data);
      
      // Solo redirigir si es un error de autenticación
      if (err.response?.status === 401) {
        console.log("Error 401, token inválido o expirado");
        // Opcionalmente puedes remover estos y solo mostrar un error
        // localStorage.removeItem("token");
        // localStorage.removeItem("isAuthenticated");
        // navigate("/login");
      }
      
      setError("Error al cargar los usuarios: " + (err.response?.data?.message || err.message));
      setLoading(false);
    }
  };

  // Cargar usuarios al montar el componente
  useEffect(() => {
    fetchUsuarios();
  }, []);

  // Funciones para el diálogo de eliminación
  const handleOpenDeleteDialog = (user) => {
    setSelectedUser(user);
    setOpenDeleteDialog(true);
  };

  const handleCloseDeleteDialog = () => {
    setOpenDeleteDialog(false);
    setSelectedUser(null);
  };

  const handleDeleteUser = async () => {
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`http://localhost:3000/users/${selectedUser.Id}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      setUsuarios(usuarios.filter(user => user.Id !== selectedUser.Id));
      setSnackbar({
        open: true,
        message: "Usuario eliminado con éxito",
        severity: "success"
      });
      handleCloseDeleteDialog();
    } catch (err) {
      console.error("Error al eliminar usuario:", err);
      setSnackbar({
        open: true,
        message: "Error al eliminar usuario",
        severity: "error"
      });
      handleCloseDeleteDialog();
    }
  };

  // Funciones para el diálogo de edición
  const handleOpenEditDialog = (user) => {
    setSelectedUser(user);
    setEditFormData({
      id: user.Id,
      name: user.Name,
      email: user.Email,
      password: ""
    });
    setOpenEditDialog(true);
  };

  const handleCloseEditDialog = () => {
    setOpenEditDialog(false);
    setSelectedUser(null);
  };

  const handleEditFormChange = (e) => {
    setEditFormData({
      ...editFormData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmitEdit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      const dataToUpdate = {
        name: editFormData.name,
        email: editFormData.email
      };
      
      // Solo incluir la contraseña si se proporcionó una nueva
      if (editFormData.password) {
        dataToUpdate.password = editFormData.password;
      }
      
      await axios.put(`http://localhost:3000/users/${editFormData.id}`, dataToUpdate, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      // Actualizar la lista de usuarios
      fetchUsuarios();
      
      setSnackbar({
        open: true,
        message: "Usuario actualizado con éxito",
        severity: "success"
      });
      handleCloseEditDialog();
    } catch (err) {
      console.error("Error al actualizar usuario:", err);
      setSnackbar({
        open: true,
        message: "Error al actualizar usuario",
        severity: "error"
      });
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({
      ...snackbar,
      open: false
    });
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("isAuthenticated");
    navigate("/login");
  };

  // Verificar autenticación
  useEffect(() => {
    const isAuthenticated = localStorage.getItem("isAuthenticated");
    if (!isAuthenticated) {
      navigate("/login");
    }
  }, [navigate]);

  return (
    <Box sx={{ display: "flex" }}>
      {/* Sidebar */}
      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          [`& .MuiDrawer-paper`]: { width: drawerWidth, boxSizing: "border-box" }
        }}
      >
        <Toolbar />
        <List>
          <ListItem button onClick={() => navigate("/")}>
            <ListItemIcon><DashboardIcon /></ListItemIcon>
            <ListItemText primary="Dashboard" />
          </ListItem>
          <ListItem button onClick={() => navigate("/usuarios")}>
            <ListItemIcon><PeopleIcon /></ListItemIcon>
            <ListItemText primary="Usuarios" />
          </ListItem>
          <ListItem button onClick={() => navigate("/contacto")}>
            <ListItemIcon><ContactMailIcon /></ListItemIcon>
            <ListItemText primary="Contacto" />
          </ListItem>
          <ListItem button onClick={handleLogout}>
            <ListItemIcon><ExitToAppIcon /></ListItemIcon>
            <ListItemText primary="Cerrar sesión" />
          </ListItem>
        </List>
      </Drawer>

      {/* Contenido Principal */}
      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <Toolbar />
        <Typography variant="h4" gutterBottom>
          Administración de Usuarios
        </Typography>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>
        ) : (
          <TableContainer component={Paper} sx={{ mt: 3, boxShadow: 3 }}>
            <Table>
              <TableHead sx={{ backgroundColor: "#f5f5f5" }}>
                <TableRow>
                  <TableCell><Typography variant="subtitle1" fontWeight="bold">ID</Typography></TableCell>
                  <TableCell><Typography variant="subtitle1" fontWeight="bold">Nombre</Typography></TableCell>
                  <TableCell><Typography variant="subtitle1" fontWeight="bold">Email</Typography></TableCell>
                  <TableCell><Typography variant="subtitle1" fontWeight="bold">Fecha Creación</Typography></TableCell>
                  <TableCell align="center"><Typography variant="subtitle1" fontWeight="bold">Acciones</Typography></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {usuarios.map((user) => (
                  <TableRow key={user.Id}>
                    <TableCell>{user.Id}</TableCell>
                    <TableCell>{user.Name}</TableCell>
                    <TableCell>{user.Email}</TableCell>
                    <TableCell>{new Date(user.CreatedAt).toLocaleDateString()}</TableCell>
                    <TableCell align="center">
                      <IconButton 
                        color="primary" 
                        onClick={() => handleOpenEditDialog(user)}
                        size="small"
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton 
                        color="error" 
                        onClick={() => handleOpenDeleteDialog(user)}
                        size="small"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        {/* Diálogo de confirmación para eliminar */}
        <Dialog open={openDeleteDialog} onClose={handleCloseDeleteDialog}>
          <DialogTitle>Eliminar Usuario</DialogTitle>
          <DialogContent>
            <DialogContentText>
              ¿Estás seguro de que deseas eliminar a {selectedUser?.Name}? Esta acción no se puede deshacer.
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDeleteDialog}>Cancelar</Button>
            <Button onClick={handleDeleteUser} color="error" variant="contained">
              Eliminar
            </Button>
          </DialogActions>
        </Dialog>

        {/* Diálogo para editar usuario */}
        <Dialog open={openEditDialog} onClose={handleCloseEditDialog} maxWidth="sm" fullWidth>
          <form onSubmit={handleSubmitEdit}>
            <DialogTitle>Editar Usuario</DialogTitle>
            <DialogContent>
              <TextField
                margin="dense"
                label="Nombre"
                name="name"
                fullWidth
                value={editFormData.name}
                onChange={handleEditFormChange}
                required
                variant="outlined"
              />
              <TextField
                margin="dense"
                label="Email"
                name="email"
                type="email"
                fullWidth
                value={editFormData.email}
                onChange={handleEditFormChange}
                required
                variant="outlined"
              />
              <TextField
                margin="dense"
                label="Nueva Contraseña (dejar en blanco para mantener la actual)"
                name="password"
                type="password"
                fullWidth
                value={editFormData.password}
                onChange={handleEditFormChange}
                variant="outlined"
              />
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseEditDialog}>Cancelar</Button>
              <Button type="submit" color="primary" variant="contained">
                Guardar
              </Button>
            </DialogActions>
          </form>
        </Dialog>

        {/* Snackbar para notificaciones */}
        <Snackbar 
          open={snackbar.open} 
          autoHideDuration={6000} 
          onClose={handleCloseSnackbar}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        >
          <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Box>
    </Box>
  );
};

export default Usuarios;