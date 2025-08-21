package main.java.br.com.pateandoapp.pateandobackend.model;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Data
public class Dogwalker {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String areaAtuacao;
    private String disponibilidade;

    // Ligação com usuário (perfil do dogwalker)
    @OneToOne
    @JoinColumn(name = "usuario_id")
    private Usuario usuario;
}
