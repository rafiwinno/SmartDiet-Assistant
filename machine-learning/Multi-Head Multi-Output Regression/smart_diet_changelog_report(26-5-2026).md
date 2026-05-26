# Laporan Perubahan Kode Smart Diet Assistant

## Ringkasan
Versi terbaru kode memperbaiki alur prediksi nutrisi, memperjelas input API, dan mengubah logika meal planning dari pembagian acak berbasis urutan menjadi pemilihan berbasis kategori makanan. Perubahan ini membuat sistem lebih stabil, lebih mudah didemokan, dan lebih masuk akal untuk konteks meal recommendation.

## Perubahan Pada Endpoint Nutrisi
### Sebelumnya
Endpoint `/predict-nutrition` menerima input yang sudah diencode (`gender_encoded`, `activity_encoded`, `goal_encoded`) dan langsung memasukkannya ke model setelah preprocessing. Output model kemudian langsung di-`inverse_transform()` oleh `target_scaler`.

### Sekarang
Input diubah menjadi bentuk natural: `gender`, `activity_level`, `goal`, `weight_kg`, `target_weight`, `height_cm`, dan `age`. Backend sekarang menghitung `bmr` dan `tdee` lebih dulu, lalu memasukkannya ke model. Response juga ditambah `input_summary` agar hasil prediksi lebih mudah dibaca dan dijelaskan saat demo.

### Dampak
- API lebih ramah untuk frontend.
- Perhitungan dasar nutrisi menjadi transparan.
- Debugging lebih mudah karena response menampilkan BMR, TDEE, dan target harian.

## Perbaikan Output Model
### Sebelumnya
`model.predict()` langsung dipass ke `target_scaler.inverse_transform()`. Saat model mengembalikan list multi-output, proses ini menyebabkan error dimensi array.

### Sekarang
Output prediksi dicek dulu. Jika hasil `predict()` berupa list, seluruh output digabung dengan `np.concatenate(..., axis=1)` sehingga bentuknya menjadi array 2D yang valid untuk `inverse_transform()`.

### Dampak
- Error 500 akibat dimensi array teratasi.
- Endpoint nutrition menjadi stabil.
- Model multi-output Keras bisa dipakai tanpa mengubah arsitektur training.

## Perubahan Pada Dataset Dan Kategori Makanan
### Sebelumnya
Dataset hanya dibersihkan dengan `dropna()`, filter kalori < 500, dan protein > 5. Tidak ada kategori meal yang jelas.

### Sekarang
Dataset diberi kolom `meal_category` melalui fungsi `map_meal_category()`. Nama makanan dipetakan ke kategori `breakfast`, `lunch`, `dinner`, atau `snack` berdasarkan keyword.

### Dampak
- Makanan bisa dipilah berdasarkan konteks meal.
- Breakfast, lunch, dan dinner tidak lagi ditentukan oleh urutan random.
- Hasil meal plan lebih natural dan lebih layak untuk demo.

## Perubahan Logika Meal Planning
### Sebelumnya
Meal plan dibuat dengan cara:
1. mengambil top food berdasarkan recommendation score,
2. random sample 6 item,
3. optimasi porsi,
4. membagi item ke breakfast, lunch, dinner berdasarkan indeks modulo.

Cara ini membuat makanan kategori apa pun bisa masuk ke meal apa pun.

### Sekarang
Meal plan dibangun per slot:
- breakfast dipilih dari kandidat breakfast,
- lunch dari kandidat lunch,
- dinner dari kandidat dinner.

Setiap slot kemudian dioptimasi porsinya secara terpisah dengan pembagian target makro 25%, 35%, dan 40%.

### Dampak
- Pembagian meal lebih masuk akal.
- Breakfast tidak lagi berisi makanan utama malam secara acak.
- Meal plan lebih sesuai dengan ekspektasi user dan dosen penguji.

## Penambahan Penalty Dan Filter Cerdas
### Sebelumnya
Sistem hanya mengandalkan `recommendation_score`. Karena itu makanan seperti flour, oil, cake, burfi, dan popcorn masih bisa terpilih jika secara makro terlihat dekat dengan target.

### Sekarang
Ditambahkan helper untuk:
- mendeteksi ingredient murni,
- mendeteksi dessert/snack,
- memberi bonus untuk breakfast-friendly food,
- menghasilkan `final_score` setelah penalty dan bonus.

### Dampak
- Ingredient murni diblok dari meal utama.
- Dessert tidak masuk lunch dan dinner.
- Snack hanya boleh muncul terbatas, terutama untuk breakfast.
- Sistem lebih cocok untuk presentasi Smart Diet Assistant.

## Perubahan Response Meal Plan
### Sebelumnya
Response meal plan hanya menampilkan:
- food,
- recommended grams,
- estimated calories,
- makro per 100g.

### Sekarang
Response ditambah dengan:
- `meal_time`,
- `meal_category`,
- `final_score`.

### Dampak
- Output lebih transparan.
- Lebih mudah menjelaskan kenapa makanan muncul di meal tertentu.
- Debugging dan evaluasi sistem menjadi lebih sederhana.

## Kesimpulan
Perubahan terbaru membuat aplikasi Smart Diet Assistant menjadi lebih stabil, lebih semantik, dan lebih relevan untuk kebutuhan demo capstone. Endpoint nutrisi kini lebih mudah dipakai, output model multi-output sudah ditangani dengan benar, dan meal plan menjadi jauh lebih natural karena memakai kategori makanan, penalty, serta pembagian meal yang lebih ketat.
