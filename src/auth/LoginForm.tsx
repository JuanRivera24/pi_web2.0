import React from 'react'

export default function LoginForm() {
  return (
    <div>
        <h1>Inicio de sesión</h1>
        <form action="inicio">
        <span>Usuario</span>
        <br/>
        <input className="bg-red-700" type="text" />
        <span>Contraseña</span>
        <br />
        <input type="password" required/>
        </form>
    </div>
  )
}
