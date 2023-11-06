import { useState, useEffect, useContext } from 'react';

import { UserContext } from '../UserContext/UserContext';
import { Button, Table, Form, Modal, Container, Row } from 'react-bootstrap';
import axios from 'axios';
import Swal from 'sweetalert2';

export function Futbolista() {
    const baseURL = 'http://localhost:3010';
    const { userData, setUserData } = useContext(UserContext);
    const [archivo, setArchivo] = useState(null);
    const changeArchivo = (e) => {
        setArchivo(e.target.files[0]);
    };


    const [formulario, setFormulario] = useState({
        dni: '',
        nombre: '',
        apellido: '',
        posicion: '',
        apodo: '',
        foto: '',
        pieHabil: '0',
    });

    const [datos, setDatos] = useState(null);
    const [idFutbolistaEditando, setIdFutbolistaEditando] = useState(null);
    const [mostrarTabla, setMostrarTabla] = useState(false);
    const [mostrarEditar, setMostrarEditar] = useState(false);
    const [mostrarAgregar, setMostrarAgregar] = useState(false);


    useEffect(() => {
        buscarFutbolistas();
    }, []);


    const mostrarTablaClick = () => {
        buscarFutbolistas();
        setMostrarTabla(true);
    };

    const ocultarTablaClick = () => {
        setMostrarTabla(false);
    };

    //  FUNCIONA
    const buscarFutbolistas = async () => {
        axios.get(baseURL + '/api/v1/futbolista/futbolistas', {
            headers: {
                Authorization: `Bearer ${userData.token}` //necesario para la autenticacion del usuario en el api
            }
        })
            .then(resp => {
                console.log(resp.data.dato);
                setDatos(resp.data.dato);
            })
            .catch(error => {
                console.log(error);
            })
    }


    //   FUNCIONA
    const eliminarFutbolista = async (idFutbolista) => {
        Swal.fire({
            title: '¿Estás seguro de eliminar el futbolista seleccionado?',
            showDenyButton: 'Sí',
        }).then((result) => {
            if (result.isConfirmed) {
                axios.delete(baseURL + '/api/v1/futbolista/futbolistas/' + idFutbolista, {
                    headers: {
                        Authorization: `Bearer ${userData.token}`,
                    }
                })
                    .then(async resp => {
                        const result = await Swal.fire({
                            text: resp.data.msj,
                            icon: 'success'
                        });

                        if (result.isConfirmed) {
                            buscarFutbolistas();
                        }
                    })
                    .catch(error => {
                        alert('ERROR')
                        console.log(error);
                    })
            }
        });
    }


    // Modificada
    const enviarInformacion = async (e) => {
        e.preventDefault();
        // Verifica si el campo de foto está vacío
        //const archivo = formulario.foto.trim() === '' ? null : formulario.foto;
        // Crea un objeto formData y agrega los datos del formulario y el archivo de foto
        const formData = new FormData();
        formData.append('dni', formulario.dni);
        formData.append('nombre', formulario.nombre);
        formData.append('apellido', formulario.apellido);
        formData.append('posicion', formulario.posicion);
        formData.append('apodo', formulario.apodo);
        formData.append('pieHabil', formulario.pieHabil);
        formData.append('foto', archivo);


        if (idFutbolistaEditando) {
            await editarActualizar(idFutbolistaEditando, formData);
        } else {
            // Usa axios para enviar el formData al servidor, usando los headers adecuados
            axios.post(baseURL + '/api/v1/futbolista/futbolistas', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'Authorization': `Bearer ${userData.token}` //necesario para la autenticacion del usuario en el api
                },
            })
                .then((res) => {
                    setFormulario({
                        dni: '',
                        nombre: '',
                        apellido: '',
                        posicion: '',
                        apodo: '',
                        foto: '',
                        pieHabil: '0',
                    });
                    buscarFutbolistas();
                    setMostrarAgregar(false);
                })
                .catch((error) => {
                    console.log('error ', error);
                });
        }
    };


    const vaciarCamposAlert = (e) => {
        e.preventDefault();

        // Borra los campos de los inputs
        setFormulario({
            dni: '',
            nombre: '',
            apellido: '',
            posicion: '',
            apodo: '',
            foto: '',
            pieHabil: '0',
        });

        // Muestra un mensaje de alerta
        alert('Operación realizada con éxito');
    };






    const editarActualizar = async (idFutbolista, formulario) => {
        //const { dni, nombre, apellido, posicion, apodo, pieHabil } = formulario;

        const formData = new FormData();
        formData.append('dni', formulario.dni);
        formData.append('nombre', formulario.nombre);
        formData.append('apellido', formulario.apellido);
        formData.append('posicion', formulario.posicion);
        formData.append('apodo', formulario.apodo);
        formData.append('pieHabil', formulario.pieHabil);
        //formData.append('foto', archivo);
        if (archivo) {
            formData.append('foto', archivo);
        }

        try {
            await axios.put(baseURL + `/api/v1/futbolista/futbolistas/${idFutbolista}`, formData, {
                headers: {
                    Authorization: `Bearer ${userData.token}`,
                    //'Content-Type': 'multipart/form-data'
                }
            });

            buscarFutbolistas();
            setFormulario({
                dni: '',
                nombre: '',
                apellido: '',
                posicion: '',
                apodo: '',
                foto: '',
                pieHabil: '0',
            });
            setIdFutbolistaEditando(null);
            mostrarAlerta('Datos actualizados correctamente');
            setMostrarEditar(false);
        } catch (error) {
            alert('No se pudo actualizar')
            console.log('Error al actualizar un futbolista', error);
        }
    };

    const mostrarFormulario = (id) => {
        const futbolista = datos.find((item) => item.idFutbolista === id);
        if (futbolista) {
            setFormulario({
                dni: futbolista.dni,
                nombre: futbolista.nombre,
                apellido: futbolista.apellido,
                apodo: futbolista.apodo,
                pieHabil: futbolista.pieHabil,
                posicion: futbolista.posicion,
                foto: futbolista.foto,
            });
            setIdFutbolistaEditando(id);
            setMostrarEditar(true);
        }
    };

    const cancelarFormulario = () => {
        setFormulario({
            dni: '',
            nombre: '',
            apellido: '',
            posicion: '',
            apodo: '',
            foto: '',
            pieHabil: '0',
        });
        setIdFutbolistaEditando(null);
        setMostrarEditar(false);
    };

    const mostrarAlerta = (mensaje) => {
        alert(mensaje);
    };

    const ocultarModalAgregar = () => {
        setMostrarAgregar(false);
    };


    const editarUpdate = async ( idFutbolista) => {
        //event.preventDefault(); // Evita que el formulario se envíe y la página se recargue

        try {
            // Desestructura los datos del futbolista actualizado
            //const { dni, nombre, apellido, posicion, apodo, pieHabil, foto } = formulario;
            const { dni, nombre, apellido, apodo, pieHabil, foto,posicion } = formulario ?? {};

            // Crea un objeto FormData y agrega los datos al mismo
            const formData = new FormData();
            formData.append('dni', dni || document.querySelector('[name="dni"]').value);
            formData.append('nombre', nombre || document.querySelector('[name="nombre"]').value);
            formData.append('apellido', apellido || document.querySelector('[name="apellido"]').value);
            formData.append('posicion', posicion || document.querySelector('[name="posicion"]').value);
            formData.append('apodo', apodo || document.querySelector('[name="apodo"]').value);
            formData.append('pieHabil', pieHabil || document.querySelector('[name="pieHabil"]').value);
            if (foto) {
                // Solo agrega la foto si se proporciona
                formData.append('foto', foto);
            }

            // Realiza una solicitud PUT al servidor para actualizar el futbolista
            await axios.put(baseURL + `/api/v1/futbolista/futbolistas/${idFutbolista}`, formData, {
                headers: {
                    Authorization: `Bearer ${userData.token}`,
                    'Content-Type': 'multipart/form-data',
                },
            });

            // Después de la actualización, puedes realizar cualquier otra acción necesaria, como refrescar la lista de futbolistas, mostrar una alerta, etc.
            buscarFutbolistas();
            setMostrarEditar(false);
            mostrarAlerta('Futbolista actualizado correctamente');
        } catch (error) {
            // En caso de error, puedes manejarlo aquí (por ejemplo, mostrar una alerta de error).
            console.log('Error al actualizar el futbolista', error);
            mostrarAlerta('No se pudo actualizar el futbolista');
        }
    };


    return (
        <>
            <Container>
                <Row>
                    <div className='espaciado2'></div>
                    <div className='espaciado2'></div>
                    <div className="text-center">
                        <Button variant="primary" onClick={() => setMostrarAgregar(true)}>
                            Agregar Futbolista
                        </Button>
                        <Button variant="primary" onClick={mostrarTablaClick}>
                            Listado Completo
                        </Button>
                    </div>
                </Row>
            </Container>


            {/* ESTE ES EL MODAL DE AGREGAR JUGADOR */}
            <Modal show={mostrarAgregar} onHide={ocultarModalAgregar} size='xl'>
                <Modal.Header closeButton>
                    <Modal.Title>Agregar Jugador</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form onSubmit={e => enviarInformacion(e)}>
                        <Form.Group className="mb-3" controlId="formBasicDniAgregar">
                            <Form.Label>DNI</Form.Label>
                            <Form.Control
                                type="text"
                                name="dni"
                                value={formulario.dni}
                                onChange={(e) => setFormulario({ ...formulario, dni: e.target.value })}
                                maxLength={8}
                                placeholder='Ingrese dni'
                                required
                                id='dni'
                            />
                        </Form.Group>
                        <Form.Group className="mb-3" controlId="formBasicNombreAgregar">
                            <Form.Label>Nombre</Form.Label>
                            <Form.Control
                                type="text"
                                name="nombre"
                                value={formulario.nombre}
                                onChange={(e) => setFormulario({ ...formulario, nombre: e.target.value })}
                                placeholder='Ingrese Nombre'
                                required
                                id='nombre'
                            />
                        </Form.Group>
                        <Form.Group className="mb-3" controlId="formBasicApellidoAgregar">
                            <Form.Label>Apellido</Form.Label>
                            <Form.Control
                                type="text"
                                name="apellido"
                                value={formulario.apellido}
                                onChange={(e) => setFormulario({ ...formulario, apellido: e.target.value })}
                                placeholder='Ingrese Apellido'
                                required
                                id='apellido'
                            />
                        </Form.Group>
                        <Form.Group className="mb-3" controlId="formBasicPosicionAgregar">
                            <Form.Label>Posición</Form.Label>
                            <Form.Control
                                as="select"
                                name="posicion"
                                value={formulario.posicion}
                                onChange={(e) => setFormulario({ ...formulario, posicion: e.target.value })}
                                id='posicion'
                            >
                                <option value="">Seleccione una opción</option>
                                <option value="0">Arquero</option>
                                <option value="1">Defensor</option>
                                <option value="2">Mediocampista</option>
                                <option value="3">Delantero</option>
                            </Form.Control>
                        </Form.Group>
                        <Form.Group className="mb-3" controlId="formBasicApodoAgregar">
                            <Form.Label>Apodo</Form.Label>
                            <Form.Control
                                type="text"
                                name="apodo"
                                value={formulario.apodo}
                                onChange={(e) => setFormulario({ ...formulario, apodo: e.target.value })}
                                placeholder='Ingrese Apodo'
                                required
                            />
                        </Form.Group>
                        <Form.Group className="mb-3" controlId="formBasicCelular">
                            <Form.Label>Ingrese Foto - Opcional</Form.Label>
                            <Form.Control type="file"
                                accept=".jpg, .jpeg, .png" // Define los tipos de archivo permitidos                                        
                                onChange={changeArchivo}
                                placeholder='Ingese Foto - Opcional'
                                id='foto'
                            />
                        </Form.Group>
                        <Form.Group className="mb-3" controlId="formBasicPieHabilAgregar">
                            <Form.Label>Pie Hábil</Form.Label>
                            <Form.Control
                                as="select"
                                name="pieHabil"
                                value={formulario.pieHabil}
                                onChange={(e) => setFormulario({ ...formulario, pieHabil: e.target.value })}
                                id='pieHabil'
                            >
                                <option value="0">Izquierdo</option>
                                <option value="1">Derecho</option>
                            </Form.Control>
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={ocultarModalAgregar}>
                        Cancelar
                    </Button>
                    <Button variant="primary" onClick={(e) => { enviarInformacion(e); ocultarModalAgregar(e); vaciarCamposAlert(e) }} type='submit'>
                        Guardar
                    </Button>
                </Modal.Footer>
            </Modal>

            {/* <Container>
                <Row>
                <div className="espaciado2"></div>
                    <Form onSubmit={handleSubmit}>
                        <InputGroup className="mb-3">
                            <InputGroup.Text>Buscar por</InputGroup.Text>
                            <Form.Select onChange={handleSelect}>
                                <option value="id">ID</option>
                                <option value="nombre">Nombre</option>
                                <option value="apellido">Apellido</option>
                                <option value="apodo">Apodo</option>
                            </Form.Select>
                            <FormControl type="text" placeholder="Ingrese su búsqueda" value={cadenaBusqueda} onChange={(e) => setCadenaBusqueda(e.target.value)} />
                            <Button variant="primary" type="submit">
                                Buscar
                            </Button>
                        </InputGroup>
                    </Form>
                </Row>
            </Container> */}

            {/* <Container>
                <Row>
                    <Alert variant="info">
                        {resultadosBusqueda.length > 0 ? (
                            <ul>
                                {resultadosBusqueda.map((item, index) => (
                                    <li key={index}>

                                        <p>DNI: {item.dni}</p>
                                        <p>Apellido: {item.apellido}</p>
                                        <p>Nombre: {item.nombre}</p>
                                        <p>Posición: {item.posicion}</p>
                                        <p>Apodo: {item.apodo}</p>
                                        <p>Foto: {item.foto ? item.foto : "Ninguna"}</p>
                                    </li>
                                ))}
                            </ul>
                        ) :
                            (
                                'Resultados de Busqueda: ')}
                    </Alert>
                </Row>
            </Container> */}

            <Container>
                <Row>

                    <div className="container mt-1 mb-5">
                        <h2>FUTBOLISTAS</h2>
                        <div className="text-center">
                            <Button variant="primary" onClick={() => ocultarTablaClick(false)}>
                                Ocultar Tabla
                            </Button>
                        </div>
                        <div className='espaciado'></div>

                        {mostrarTabla && (
                            <Table striped bordered hover variant='dark' responsive='lg'>
                                <thead>
                                    <tr>
                                        <th className="miThead">ID</th>
                                        <th className="miThead">DNI</th>
                                        <th className="miThead">Apellido</th>
                                        <th className="miThead">Nombre</th>
                                        <th className="miThead">Posición</th>
                                        <th className="miThead">Apodo</th>
                                        <th className="miThead">Foto</th>
                                        <th className="miThead">Pie Habil</th>
                                        <th className="miThead">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {datos ? (
                                        datos.map((item, index) => (
                                            <tr key={index}>
                                                <td>{item.idFutbolista}</td>
                                                <td>{item.dni}</td>
                                                <td>{item.apellido}</td>
                                                <td>{item.nombre}</td>
                                                <td>{item.posicion}</td>
                                                <td>{item.apodo}</td>
                                                {/* <td>{item.foto ? item.foto : 'Ninguna'}</td> */}
                                                <td>
                                                    <img
                                                        className='foto'
                                                        src={`http://localhost:3010/archivos/${item.foto}`} alt={item.foto}

                                                    />
                                                </td>
                                                <td>{item.pieHabil}</td>

                                                <td>
                                                    <Button variant="success" className="miBoton" onClick={() => mostrarFormulario(item.idFutbolista)}>
                                                        Edit
                                                    </Button>
                                                    <Button variant="danger" onClick={() => eliminarFutbolista(item.idFutbolista)}>
                                                        X
                                                    </Button>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="6">No hay futbolistas disponibles</td>
                                        </tr>
                                    )}
                                </tbody>
                            </Table>
                        )}
                    </div>

                    <Modal show={mostrarEditar} onHide={cancelarFormulario} size='xl' className='editarJugador'>
                        <Modal.Header closeButton>
                            <Modal.Title>Editar Jugador</Modal.Title>
                        </Modal.Header>
                        <Modal.Body>
                            <Form onSubmit={() => editarUpdate()}>
                                <Form.Group className="mb-3" controlId="formBasicDniEditar">
                                    <Form.Label>DNI</Form.Label>
                                    <Form.Control
                                        type="text"
                                        name="dni"
                                        value={formulario.dni}
                                        onChange={(e) => setFormulario({ ...formulario, dni: e.target.value })}
                                        maxLength={8}
                                        required
                                    />
                                </Form.Group>
                                <Form.Group className="mb-3" controlId="formBasicNombreEditar">
                                    <Form.Label>Nombre</Form.Label>
                                    <Form.Control
                                        type="text"
                                        name="nombre"
                                        value={formulario.nombre}
                                        onChange={(e) => setFormulario({ ...formulario, nombre: e.target.value })}
                                        required
                                    />
                                </Form.Group>
                                <Form.Group className="mb-3" controlId="formBasicApellidoEditar">
                                    <Form.Label>Apellido</Form.Label>
                                    <Form.Control
                                        type="text"
                                        name="apellido"
                                        value={formulario.apellido}
                                        onChange={(e) => setFormulario({ ...formulario, apellido: e.target.value })}
                                        required
                                    />
                                </Form.Group>
                                <Form.Group className="mb-3" controlId="formBasicPosicionEditar">
                                    <Form.Label>Posición</Form.Label>
                                    <Form.Control
                                        as="select"
                                        name="posicion"
                                        value={formulario.posicion}
                                        onChange={(e) => setFormulario({ ...formulario, posicion: e.target.value })}
                                    >
                                        <option value="">Seleccione una opción</option>
                                        <option value="0">Arquero</option>
                                        <option value="1">Defensor</option>
                                        <option value="2">Mediocampista</option>
                                        <option value="3">Delantero</option>
                                    </Form.Control>
                                </Form.Group>
                                <Form.Group className="mb-3" controlId="formBasicApodoEditar">
                                    <Form.Label>Apodo</Form.Label>
                                    <Form.Control
                                        type="text"
                                        name="apodo"
                                        value={formulario.apodo}
                                        onChange={(e) => setFormulario({ ...formulario, apodo: e.target.value })}
                                        required
                                    />
                                </Form.Group>
                                <Form.Group className="mb-3" controlId="formBasicPieHabilEditar">
                                    <Form.Label>Pie Hábil</Form.Label>
                                    <Form.Control
                                        as="select"
                                        name="pieHabil"
                                        value={formulario.pieHabil}
                                        onChange={(e) => setFormulario({ ...formulario, pieHabil: e.target.value })}
                                    >
                                        <option value="0">Izquierdo</option>
                                        <option value="1">Derecho</option>
                                    </Form.Control>
                                </Form.Group>
                            </Form>
                        </Modal.Body>
                        <Modal.Footer>
                            <Button variant="secondary" onClick={cancelarFormulario}>
                                Cancelar
                            </Button>
                            <Button variant="primary" type='submit' onClick={() => editarUpdate()}>
                                Guardar
                            </Button>
                        </Modal.Footer>
                    </Modal>

                </Row>

            </Container>


        </>
    );
}



{/* <Form.Group className="mb-3" controlId="formBasicCelular">
                            <Form.Label>Seleccionar Archivo:</Form.Label>
                            <Form.Control type="file"
                                accept=".jpg, .jpeg, .png" // Define los tipos de archivo permitidos                                        
                                onChange={changeArchivo}
                            />
                        </Form.Group> */}