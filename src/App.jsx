import { useEffect, useState, useCallback } from 'react'
import SearchInput from './components/SearchInput'
import UserCard from './components/UserCard'
import axios from 'axios'
import ReactModal from 'react-modal'
import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { motion } from 'framer-motion'
import { CircularProgress } from '@mui/material'
import { useAuth } from './context/AuthContext'
import { useNavigate } from 'react-router-dom'   // 👈 importamos el hook

export default function App() {
  const [usuarios, setUsuarios] = useState([])
  const [loading, setLoading] = useState(false)
  const [modalAbierto, setModalAbierto] = useState(false)
  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState(null)
  const [buscando, setBuscando] = useState(false)
  const [filtrados, setFiltrados] = useState([])

  const { logout } = useAuth()
  const navigate = useNavigate()   // 👈 inicializamos el hook

  const API_URL = 'http://localhost:3001'

  const handleLogout = () => {
    logout()
    navigate('/login')  
  }

  const obtenerUsuarios = async () => {
    try {
      const response = await axios.get(`${API_URL}/usuarios`)
      setUsuarios(response.data)
      setFiltrados(response.data)
    } catch (error) {
      console.error('Error al obtener usuarios:', error.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    obtenerUsuarios()
  }, [])

  const filtrarUsuarios = useCallback(
    (query) => {
      setBuscando(true)
      setTimeout(() => {
        const q = query.trim().toLowerCase()
        const resultados = usuarios.filter((usuario) =>
          [
            usuario.nombre,
            usuario.apellidos,
            usuario.intereses,
            usuario.perfil,
            usuario.correo,
          ].some((campo) => String(campo).toLowerCase().includes(q))
        )

        setFiltrados(resultados)
        setBuscando(false)
        if (resultados.length === 0) {
          toast.info(
            'No se encontraron usuarios que coincidan con la búsqueda.',
            {
              position: 'top-right',
              autoClose: 3000,
              hideProgressBar: false,
              closeOnClick: true,
              pauseOnHover: true,
              draggable: true,
              progress: undefined,
              theme: 'light',
            }
          )
        }
      }, 2000)
    },
    [usuarios]
  )

  const abrirModal = (usuario) => {
    setUsuarioSeleccionado(usuario)
    setModalAbierto(true)
  }

  const cerrarModal = () => {
    setModalAbierto(false)
    setUsuarioSeleccionado(null)
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      {/* 🔹 Botón logout que redirige */}
      <button
        className="bg-green-500 text-white px-4 py-2 rounded"
        onClick={handleLogout}
      >
        Cerrar sesión
      </button>

      <h1 className="text-2xl font-bold mb-4 text-center">
        Buscador interactivo
      </h1>
      <div className="max-w-md mx-auto mb-6">
        <SearchInput onSearch={filtrarUsuarios} />
      </div>

      {loading && (
        <div className="flex justify-center items-center my-10">
          <CircularProgress />
        </div>
      )}

      {buscando && (
        <div className="flex justify-center items-center my-10">
          <CircularProgress color="primary" />
        </div>
      )}

      {!buscando && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.isArray(filtrados) &&
            filtrados.map((usuario) => (
              <UserCard
                onClick={() => abrirModal(usuario)}
                key={usuario.id}
                usuario={usuario}
              />
            ))}
        </div>
      )}

      <ReactModal
        isOpen={modalAbierto}
        onRequestClose={cerrarModal}
        className="bg-white p-6 rounded shadow-lg max-w-md mx-auto mt-20 outline-none transition-all"
        overlayClassName="fixed inset-0 bg-black/50 bg-opacity-50 flex items-center justify-center"
      >
        {usuarioSeleccionado && (
          <motion.div
            className="text-center"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            <img
              className="w-24 h-24 object-cover rounded-full mx-auto mb-2"
              src={usuarioSeleccionado.foto}
              alt={usuarioSeleccionado.nombre}
            />
            <h2 className="text-xl font-bold mb-4">
              {usuarioSeleccionado.nombre} {usuarioSeleccionado.apellidos}
            </h2>
            <p>
              <strong>Ocupación:</strong> {usuarioSeleccionado.ocupacion}
            </p>
            <p>
              <strong>Perfil:</strong> {usuarioSeleccionado.perfil}
            </p>
            <p>
              <strong>Correo:</strong> {usuarioSeleccionado.correo}
            </p>
            <p>
              <strong>Intereses:</strong> {usuarioSeleccionado.intereses}
            </p>
            <button
              onClick={cerrarModal}
              className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Cerrar
            </button>
          </motion.div>
        )}
      </ReactModal>

      <ToastContainer /> 
    </div>
  )
}
