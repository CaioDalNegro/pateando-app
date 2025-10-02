package br.com.pateandoapp.pateandobackend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Positive;
import lombok.Data;

@Data
public class PetDTO {
    @NotBlank(message = "O nome é obrigatório")
    private String nome;

    private String raca;

    @Positive(message = "A idade deve ser positiva")
    private int idade;

    private String necessidadesEspeciais;
    private String observacoes;
}
