import jakarta.persistence.*;
import lombok.Data;

@Entity
@Data
public class Pet {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String nome;
    private String raca;
    private int idade;
    private String necessidadesEspeciais;
    private String observacoes;

    // Cada pet pertence a um Usuário
    @ManyToOne
    @JoinColumn(name = "cliente_id")
    private Usuario cliente;
}
