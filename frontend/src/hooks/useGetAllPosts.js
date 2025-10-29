import { useQuery } from "@tanstack/react-query";
import { getAllPosts } from "../lib/api.js";
const useGetAllPosts = () => {
    const {
        data: posts,
        isLoading,
        error,
        refetch, 
    } = useQuery({
        queryKey: ["posts"],
        queryFn: getAllPosts,
    });

    return { posts, isLoading, error, refetch };
};

export default useGetAllPosts;