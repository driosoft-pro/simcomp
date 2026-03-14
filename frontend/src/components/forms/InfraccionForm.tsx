function InfraccionForm() {
  return (
    <form className="space-y-4">
      <input type="text" placeholder="Código" className="w-full border p-2 rounded-lg"/>
      <input type="text" placeholder="Descripción" className="w-full border p-2 rounded-lg"/>
      <input type="number" placeholder="Valor" className="w-full border p-2 rounded-lg"/>
    </form>
  )
}

export default InfraccionForm