export type ModulId =
  | 'spok'
  | 'penjumlahan'
  | 'pengurangan'
  | 'perkalian'
  | 'pembagian';

export type LevelId = 'mudah' | 'sedang' | 'sulit';

export interface MateriStep {
  title: string;
  body: string;
  contoh?: string[];
  tips?: string;
}

export interface MateriRow {
  id: string;
  modul: ModulId;
  level: LevelId;
  urutan: number;
  judul: string;
  isi: MateriStep[];
}

export interface Soal {
  id: string;
  pertanyaan: string;
  pilihan: string[];
  jawaban: number; // index pilihan yang benar
  pembahasan?: string;
}

export interface SoalSet {
  modul: ModulId;
  level: LevelId;
  soal: Soal[];
}
