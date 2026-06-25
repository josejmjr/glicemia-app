export function formatarDataHora(data, hora) {
  const [ano, mes, dia] = data.split('-');
  const horaFormatada = hora.split('.')[0];
  return `${dia}/${mes}/${ano} ${horaFormatada}`;
}

export function formatarDataHoraGrafico(data, hora) {
  const [ano, mes, dia] = data.split('-');
  const horaMin = hora.split('.')[0].substring(0, 5);
  return `${dia}/${mes} ${horaMin}`;
}
