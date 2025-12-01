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
    private String disponibilidade; // DISPONIVEL, INDISPONIVEL, OCUPADO

    // Preço por 30 minutos de passeio
    @Column(name = "preco_30min")
    private Double preco30min = 25.0;

    // Preço por 60 minutos de passeio
    @Column(name = "preco_60min")
    private Double preco60min = 40.0;

    // Preço por 90 minutos de passeio
    @Column(name = "preco_90min")
    private Double preco90min = 55.0;

    // Avaliação média (de 1 a 5)
    @Column(name = "avaliacao_media")
    private Double avaliacaoMedia = 5.0;

    // Total de passeios realizados
    @Column(name = "total_passeios")
    private Integer totalPasseios = 0;

    // Descrição/bio do dogwalker
    @Column(length = 500)
    private String descricao;

    // URL da foto de perfil
    @Column(name = "foto_url")
    private String fotoUrl;
}