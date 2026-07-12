import { useState, useEffect } from "react"
import { type Book } from "../../types/types"
import axios from "axios";

export default function Book() {
    const [books, setBooks] = useState<Book[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        async function loadBook() {
            try {
                const response = await axios.get<Book[]>(
                    'http://127.0.0.1:8001/api/books/'
                );
                
                setBooks(response.data);

            }catch (err) {
                const message =
                err instanceof Error ? err.message : "Неизвестная ошибка";
                setError(message);
            } finally {
            setLoading(false);
        }   
      }
      loadBook();
    }, []); 
      
    if (loading) {
        return <p>Идет загрузка...</p>;
    }

    if (error) {
        return <p>Ошибка: {error}</p>;
    }

    return (
      <div>
      <h1>Список постов</h1>

      <ul>
        {books?.map((book) => (
          <li key={book.id}>
            <p>{book.title}</p>
            <h2>{book.author}</h2>
          </li>
        ))}
      </ul>
    </div>
  );
}
