package br.com.pateandoapp.pateandobackend.DTO;

/**
 * DTO para retornar estatísticas do cliente
 */
public class ClienteEstatisticasDTO {
    
    private int totalPasseios;
    private int totalMinutos;
    private String horasFormatadas;
    private String dogwalkerFavorito;
    private int passeiosComFavorito;

    // Construtor vazio
    public ClienteEstatisticasDTO() {}

    // Construtor completo
    public ClienteEstatisticasDTO(int totalPasseios, int totalMinutos, String dogwalkerFavorito, int passeiosComFavorito) {
        this.totalPasseios = totalPasseios;
        this.totalMinutos = totalMinutos;
        this.horasFormatadas = formatarHoras(totalMinutos);
        this.dogwalkerFavorito = dogwalkerFavorito;
        this.passeiosComFavorito = passeiosComFavorito;
    }

    // Formata minutos em horas (ex: 150 min -> "2h30")
    private String formatarHoras(int minutos) {
        if (minutos == 0) return "0h";
        int horas = minutos / 60;
        int mins = minutos % 60;
        if (mins == 0) return horas + "h";
        if (horas == 0) return mins + "min";
        return horas + "h" + mins;
    }

    // Getters e Setters
    public int getTotalPasseios() {
        return totalPasseios;
    }

    public void setTotalPasseios(int totalPasseios) {
        this.totalPasseios = totalPasseios;
    }

    public int getTotalMinutos() {
        return totalMinutos;
    }

    public void setTotalMinutos(int totalMinutos) {
        this.totalMinutos = totalMinutos;
        this.horasFormatadas = formatarHoras(totalMinutos);
    }

    public String getHorasFormatadas() {
        return horasFormatadas;
    }

    public String getDogwalkerFavorito() {
        return dogwalkerFavorito;
    }

    public void setDogwalkerFavorito(String dogwalkerFavorito) {
        this.dogwalkerFavorito = dogwalkerFavorito;
    }

    public int getPasseiosComFavorito() {
        return passeiosComFavorito;
    }

    public void setPasseiosComFavorito(int passeiosComFavorito) {
        this.passeiosComFavorito = passeiosComFavorito;
    }
}