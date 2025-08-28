package br.com.pateandoapp.pateandobackend.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Classe que representa o Pet do Cliente.
 */
@Data
@AllArgsConstructor
@NoArgsConstructor
@Entity
@Table(name = "pets")
public class Pet {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String nome;

    @Column(nullable = false)
    private String raca;

    @Positive(message = "A idade do cachorro deve ser um numero positivo")
    private int idade;
    private String necessidadesEspeciais;
    private String observacoes;

    // Muitos pets pertencem a UM usuário
    @ManyToOne
    @JoinColumn(name = "usuario_id", referencedColumnName = "id") // Define a coluna "usuario_id" como chave estrangeira, que referencia o "id" da tabela "usuario"
    private Usuario dono;
}
