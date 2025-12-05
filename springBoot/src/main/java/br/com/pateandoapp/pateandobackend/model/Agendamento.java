package br.com.pateandoapp.pateandobackend.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * Classe que representa o agendamento de uma caminhada entre Cliente, Pets e Dogwalker.
 * Suporta múltiplos pets (até 3) por passeio.
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

    // ✅ MUDANÇA: Lista de Pets que serão passeados (até 3)
    @ManyToMany
    @JoinTable(
        name = "agendamento_pets",
        joinColumns = @JoinColumn(name = "agendamento_id"),
        inverseJoinColumns = @JoinColumn(name = "pet_id")
    )
    private List<Pet> pets = new ArrayList<>();

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
     * EM_ANDAMENTO → Passeio em andamento
     * CONCLUIDO→ Passeio finalizado
     * CANCELADO → Cliente cancelou
     */
    @Column(nullable = false)
    private String status = "PENDENTE";

    // ✅ Método auxiliar para compatibilidade - retorna o primeiro pet
    public Pet getPet() {
        return pets != null && !pets.isEmpty() ? pets.get(0) : null;
    }

    // ✅ Método auxiliar para adicionar pet
    public void addPet(Pet pet) {
        if (pets == null) {
            pets = new ArrayList<>();
        }
        if (pets.size() < 3) {
            pets.add(pet);
        }
    }
}