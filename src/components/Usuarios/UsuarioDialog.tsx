import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
} from '@mui/material';
import type { UsuarioType } from './type';
import { useActionState } from 'react';
import type { ActionState } from '../../interfaces';
import type { UsuariosFormValues } from '../../models';
import { createInitialState } from '../../helpers';

export type UsuarioActionState = ActionState<UsuariosFormValues>;

interface Props {
  open: boolean;
  usuario?: UsuarioType | null;
  onClose: () => void;
  handleCreateEdit: (
    _: UsuarioActionState | undefined,
    formData: FormData
  ) => Promise<UsuarioActionState | undefined>;
}
export const UsuarioDialog = ({ onClose, open, usuario, handleCreateEdit }: Props) => {
  const initialState = createInitialState<UsuariosFormValues>();

  const [state, submitAction, isPending] = useActionState(
    handleCreateEdit,
    initialState
  );

  return (
    <Dialog open={open} onClose={onClose} maxWidth={'sm'} fullWidth>
      <DialogTitle>{usuario ? 'Editar usuario' : 'Nuevo usuario'}</DialogTitle>
      <Box key={usuario?.id ?? 'new'} component={'form'} action={submitAction}>
        <DialogContent>
          <TextField
            name="name"
            autoFocus
            margin="dense"
            label="Nombre del Usuario"
            fullWidth
            required
            variant="outlined"
            disabled={isPending}
            defaultValue={state?.formData?.username || usuario?.username || ''}
            error={!!state?.errors?.username}
            helperText={state?.errors?.username}
            sx={{ mb: 2 }}
          />
          <TextField
            name="password"
            margin="dense"
            label="Contraseña"
            type="password"
            fullWidth
            required
            variant="outlined"
            disabled={isPending}
            defaultValue={state?.formData?.password || ''}
            error={!!state?.errors?.password}
            helperText={state?.errors?.password}
            sx={{ mb: 2 }}
          />
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={onClose} color="inherit" disabled={isPending}>
            Cancelar
          </Button>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={isPending}
            startIcon={isPending ? <CircularProgress /> : null}
          >
            {usuario ? 'Modificar' : 'Crear'}
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
};