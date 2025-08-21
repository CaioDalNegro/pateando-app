import jakarta.persistence.*;
import lombok.Data;

@Entity
@Data // Gera getters, setters e construtores automaticamente
public class Usuario {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String nome;

    private String email;

    private String senha;

    // Papel do usuário: "CLIENTE" ou "DOGWALKER"
    private String role;
}