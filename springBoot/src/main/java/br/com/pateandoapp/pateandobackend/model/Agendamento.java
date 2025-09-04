package br.com.pateandoapp.pateandobackend.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * Classe que representa o agendamento de uma caminhada entre Cliente, Pet e Dogwalker.
 */
@Data
@AllArgsConstructor
@NoArgsConstructor
@Entity
@Table(name = "agendamentos")
public class Agendamento {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Cliente que fez o pedido
    @ManyToOne
    @JoinColumn(name = "cliente_id", nullable = false)
    private Usuario cliente;

    // Pet que será passeado
    @ManyToOne
    @JoinColumn(name = "pet_id", nullable = false)
    private Pet pet;

    // Dogwalker responsável
    @ManyToOne
    @JoinColumn(name = "dogwalker_id", nullable = false)
    private Dogwalker dogwalker;

    // Data e hora do passeio
    @Column(nullable = false)
    private LocalDateTime dataHora;

    // Duração estimada (em minutos)
    @Column(nullable = false)
    private int duracao;

    // Rota ou local de encontro
    private String rota;

    // Observações especiais do cliente
    private String observacoes;

    /**
     * Status do agendamento:
     * PENDENTE → cliente solicitou, aguardando Dogwalker aceitar
     * ACEITO   → Dogwalker aceitou, vai para agenda
     * REJEITADO→ Dogwalker recusou
     * CONCLUIDO→ Passeio finalizado
     */
    @Column(nullable = false)
    private String status = "PENDENTE";
}
