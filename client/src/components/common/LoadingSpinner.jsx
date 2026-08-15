// React import not required with new JSX transform

const LoadingSpinner = ({ message = 'Loading...' }) => (
  <div className="loading-state">
    <div className="loading-spinner" />
    <p>{message}</p>
  </div>
);

export default LoadingSpinner;
