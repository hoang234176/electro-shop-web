import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";

function Search(){
    const [searchParams] = useSearchParams();
    const [resualt, setResualt] = useState<string | null>(null);

    useEffect(() => {
        const resSearch = searchParams.get("q");
        setResualt(resSearch);
    }, [searchParams]);

    return (
        <div>{resualt}</div>
    )
}

export default Search;