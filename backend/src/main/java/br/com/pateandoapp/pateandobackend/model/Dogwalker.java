package br.com.pateandoapp.pateandobackend.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Classe que representa o Dogwalker (profissional que passeia com os pets).
 * Está relacionada à entidade Usuario.
 */
@Data
@AllArgsConstructor
@NoArgsConstructor
@Entity
@Table(name = "dogwalkers")
public class Dogwalker {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne // Relacionamento 1:1
    @JoinColumn(name = "usuario_id", referencedColumnName = "id")
    private Usuario usuario; // Um Dogwalker é também um Usuario

    @Column(nullable = false)
    private String disponibilidade;
}