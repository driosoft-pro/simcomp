function VehiculoForm() {
  return (
    <form className="space-y-4">
      <input type="text" placeholder="Placa" className="w-full border p-2 rounded-lg"/>
      <input type="text" placeholder="Marca" className="w-full border p-2 rounded-lg"/>
      <input type="text" placeholder="Modelo" className="w-full border p-2 rounded-lg"/>
    </form>
  )
}

export default VehiculoForm