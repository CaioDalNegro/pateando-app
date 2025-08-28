package br.com.pateandoapp.pateandobackend.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Classe que representa o usuário do sistema.
 * Pode ser tanto Cliente quanto Dogwalker (diferenciado pelo campo "tipo").
 */
@Data // Gera automaticamente getters, setters, equals, hashCode e toString
@AllArgsConstructor // Construtor com todos os atributos
@NoArgsConstructor  // Construtor vazio
@Entity // Indica que a classe é uma entidade JPA (será mapeada para o banco de dados)
@Table(name = "usuarios") // Nome da tabela no banco
public class Usuario {

    // Atributos
    @Id // Indica que é chave primaria 
    @GeneratedValue(strategy = GenerationType.IDENTITY) //Auto incremento
    private Long id;

    @Column(nullable = false) // Não pode ser nulo e deve ser único
    private String nome;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false)
    private String senha;

    /**
     * Tipo do usuário: "CLIENTE" ou "DOGWALKER"
     */
    @Column(nullable = false)
    private String tipo;
}