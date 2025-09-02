import { Box } from '@mui/material';
import {
  UsuarioDialog,
  UsuarioFilter,
  UsuarioHeader,
  UsuarioTabla,
  type UsuarioActionState,
} from '../../components';
import { useEffect, useState } from 'react';
import type { GridPaginationModel, GridSortModel } from '@mui/x-data-grid';
import { useAlert, useAxios } from '../../hooks';
import { errorHelper, hanleZodError } from '../../helpers';
import type { UsuarioFilterStatusType, UsuarioType } from '../../components/Usuarios/type';
import { schemaUsuarios, type UsuariosFormValues } from '../../models';

export const UsuariosPage = () => {
  const { showAlert } = useAlert();
  const axios = useAxios();

  const [filterStatus, setFilterStatus] = useState<UsuarioFilterStatusType>('all');
  const [search, setSearch] = useState('');
  const [usuarios, setUsuarios] = useState<UsuarioType[]>([]);
  const [total, setTotal] = useState(0);
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
    page: 1,
    pageSize: 10,
  });
  const [sortModel, setSortModel] = useState<GridSortModel>([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [task, setTask] = useState<UsuarioType | null>(null);

  useEffect(() => {
    listUsuarioApi();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, filterStatus, paginationModel, sortModel]);

  const listUsuarioApi = async () => {
    try {
      const orderBy = sortModel[0]?.field;
      const orderDir = sortModel[0]?.sort;
      const response = await axios.get('/users', {
        params: {
          page: paginationModel.page + 1,
          limit: paginationModel.pageSize,
          orderBy,
          orderDir,
          search,
          status: filterStatus === 'all' ? undefined : filterStatus,
        },
      });
      setUsuarios(response.data.data);
      setTotal(response.data.total);
    } catch (error) {
      showAlert(errorHelper(error), 'error');
    }
  };

  const handleOpenCreateDialog = () => {
    setOpenDialog(true);
    setTask(null);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setTask(null);
  };

  const handleOpenEditDialog = (task: UsuarioType) => {
    setOpenDialog(true);
    setTask(task);
  };

  const handleCreateEdit = async (
    _: UsuarioActionState | undefined,
    formdata: FormData
  ) => {
    const rawData = {
      username: formdata.get('name') as string,
      password: formdata.get('password') as string,
    };

    try {
      schemaUsuarios.parse(rawData);
      if (task?.id) {
        console.log("id del usuario: " + task.id); 
        console.log("informacion: " + rawData); 
        await axios.put(`/users/${task.id}`, rawData);
        showAlert('Usuario editado', 'success');
      } else {

        await axios.post('/users', rawData);
        showAlert('Usuario creado', 'success');
      }
      listUsuarioApi();
      handleCloseDialog();
      return;
    } catch (error) {
      const err = hanleZodError<UsuariosFormValues>(error, rawData);
      showAlert(err.message, 'error');
      return err;
    }
  };

  const handleDelete = async (id: number) => {
    try {
      const confirmed = window.confirm('¿Estas seguro de eliminar?');
      if (!confirmed) return;

      await axios.delete(`/users/${id}`);
      showAlert('Usuario eliminado', 'success');
      listUsuarioApi();
    } catch (error) {
      showAlert(errorHelper(error), 'error');
    }
  };

  const handleDone = async (id: number, status: string) => {
    try {
      const confirmed = window.confirm(
        '¿Estas seguro de que quieres cambiar el estado?'
      );
      if (!confirmed) return;

      await axios.patch(`/users/${id}`, { status: status === 'active' ? 'inactive' : 'active' });
      showAlert('Estado de usuario modificado', 'success');
      listUsuarioApi();
    } catch (error) {
      showAlert(errorHelper(error), 'error');
    }
  };

  return (
    <Box sx={{ width: '100%' }}>
      {/* Header con titulo y boton agregar */}
      <UsuarioHeader handleOpenCreateDialog={handleOpenCreateDialog} />

      {/* Barra de herramientas con filtros y busquedas */}
      <UsuarioFilter
        filterStatus={filterStatus}
        setFilterStatus={setFilterStatus}
        setSearch={setSearch}
      ></UsuarioFilter>

      {/* Tabla */}
      <UsuarioTabla
        usuarios={usuarios}
        rowCount={total}
        paginationModel={paginationModel}
        setPaginationModel={setPaginationModel}
        sortModel={sortModel}
        setSortModel={setSortModel}
        handleDelete={handleDelete}
        handleDone={handleDone}
        handleOpenEditDialog={handleOpenEditDialog}
      />

      {/* Dialog */}
      <UsuarioDialog
        open={openDialog}
        usuario={task}
        onClose={handleCloseDialog}
        handleCreateEdit={handleCreateEdit}
      />
    </Box>
  );
};