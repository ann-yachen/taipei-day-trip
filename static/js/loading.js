const loading = document.getElementById("loading");

const LoadingView = {
    showLoading: function(isFetching){
        loading.style.display = isFetching ? "block" : "none";
    }
}

export {
    loading,
    LoadingView
}