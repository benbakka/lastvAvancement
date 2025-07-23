package com.chantierpro.controller;

import com.chantierpro.entity.Villa;
import com.chantierpro.service.VillaService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.List;

@RestController
@RequestMapping("/villas")
@CrossOrigin(origins = "http://localhost:3000")
public class VillaController {

    @Autowired
    private VillaService villaService;

    @GetMapping
    public ResponseEntity<List<Villa>> getAllVillas(@RequestParam(required = false) Long projectId) {
        List<Villa> villas;
        if (projectId != null) {
            villas = villaService.getVillasByProjectId(projectId);
        } else {
            villas = villaService.getAllVillas();
        }
        return ResponseEntity.ok(villas);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Villa> getVillaById(@PathVariable Long id) {
        return villaService.getVillaById(id)
                .map(villa -> ResponseEntity.ok().body(villa))
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<Villa> createVilla(@Valid @RequestBody Villa villa) {
        try {
            Villa createdVilla = villaService.createVilla(villa);
            return ResponseEntity.ok(createdVilla);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<Villa> updateVilla(@PathVariable Long id, @Valid @RequestBody Villa villaDetails) {
        try {
            Villa updatedVilla = villaService.updateVilla(id, villaDetails);
            return ResponseEntity.ok(updatedVilla);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteVilla(@PathVariable Long id) {
        try {
            villaService.deleteVilla(id);
            return ResponseEntity.ok().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/search")
    public ResponseEntity<List<Villa>> searchVillas(
            @RequestParam(required = false) Long projectId,
            @RequestParam String q) {
        List<Villa> villas = villaService.searchVillas(projectId, q);
        return ResponseEntity.ok(villas);
    }

    @GetMapping("/status/{status}")
    public ResponseEntity<List<Villa>> getVillasByStatus(@PathVariable Villa.VillaStatus status) {
        List<Villa> villas = villaService.getVillasByStatus(status);
        return ResponseEntity.ok(villas);
    }

    @PutMapping("/{id}/stats")
    public ResponseEntity<?> updateVillaStats(@PathVariable Long id) {
        try {
            villaService.updateVillaStats(id);
            return ResponseEntity.ok().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
}