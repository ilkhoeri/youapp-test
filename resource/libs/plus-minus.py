# plusMinus

def plusMinus(arr):
  n = len(arr)
  positive_count = sum(1 for x in arr if x > 0)
  negative_count = sum(1 for x in arr if x < 0)
  zero_count = sum(1 for x in arr if x == 0)

  # Menghitung rasio
  positive_ratio = positive_count / n
  negative_ratio = negative_count / n
  zero_ratio = zero_count / n

  # Mencetak hasil dengan presisi 6 desimal
  print(f"{positive_ratio:.6f}")
  print(f"{negative_ratio:.6f}")
  print(f"{zero_ratio:.6f}")

# Contoh penggunaan
arr = [-4, 3, -9, 0, 4, 1]
plusMinus(arr)
